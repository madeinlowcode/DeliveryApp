// AIDEV-NOTE: API middleware utilities
// Provides common middleware functionality for Next.js API routes

import { NextRequest, NextResponse } from 'next/server'
import { logger, createLogger, createTimer, type LogContext } from './logger'
import { checkRateLimitAsync, getRateLimitHeaders } from './security/rate-limiter'
import { sanitizeObject } from './security/sanitize'
import { isValidUUID } from './security/validation'

// Types
export interface ApiContext {
  requestId: string
  logger: ReturnType<typeof createLogger>
  userId?: string
  tenantId?: string
  startTime: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    requestId: string
    timestamp: string
    duration?: number
  }
}

/**
 * Create API context for a request
 */
export function createApiContext(req: NextRequest): ApiContext {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID()
  const userId = req.headers.get('x-user-id') || undefined
  const tenantId = req.headers.get('x-tenant-id') || undefined

  const requestLogger = createLogger({
    requestId,
    userId,
    tenantId,
    method: req.method,
    path: req.nextUrl.pathname,
  })

  return {
    requestId,
    logger: requestLogger,
    userId,
    tenantId,
    startTime: Date.now(),
  }
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  context: ApiContext,
  status = 200
): NextResponse<ApiResponse<T>> {
  const duration = Date.now() - context.startTime

  context.logger.response('API', '', status, duration, { path: undefined, method: undefined })

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        duration,
      },
    },
    { status }
  )
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  context: ApiContext,
  status = 500,
  details?: unknown,
  error?: unknown
): NextResponse<ApiResponse<never>> {
  const duration = Date.now() - context.startTime

  context.logger.error(`API Error: ${code}`, { statusCode: status, durationMs: duration }, error)

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      meta: {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        duration,
      },
    },
    { status }
  )
}

/**
 * Common error response helpers
 */
export const errors = {
  badRequest: (context: ApiContext, message = 'Invalid request', details?: unknown) =>
    errorResponse('BAD_REQUEST', message, context, 400, details),

  unauthorized: (context: ApiContext, message = 'Authentication required') =>
    errorResponse('UNAUTHORIZED', message, context, 401),

  forbidden: (context: ApiContext, message = 'Access denied') =>
    errorResponse('FORBIDDEN', message, context, 403),

  notFound: (context: ApiContext, message = 'Resource not found') =>
    errorResponse('NOT_FOUND', message, context, 404),

  conflict: (context: ApiContext, message = 'Resource conflict', details?: unknown) =>
    errorResponse('CONFLICT', message, context, 409, details),

  validationError: (context: ApiContext, details: unknown) =>
    errorResponse('VALIDATION_ERROR', 'Validation failed', context, 422, details),

  rateLimited: (context: ApiContext, retryAfter?: number) => {
    const response = errorResponse(
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
      context,
      429
    )
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }
    return response
  },

  serverError: (context: ApiContext, error?: unknown) =>
    errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', context, 500, undefined, error),
}

/**
 * Rate limit middleware (async - uses Redis in production)
 */
export async function withRateLimit(
  identifier: string,
  limit = 60
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const result = await checkRateLimitAsync(identifier, { maxRequests: limit })
  const headers = getRateLimitHeaders(result)

  return {
    allowed: result.allowed,
    headers,
  }
}

/**
 * Parse and validate request body
 */
export async function parseBody<T>(req: NextRequest, context: ApiContext): Promise<T | null> {
  try {
    const body = await req.json()
    // Sanitize all string fields
    const sanitized = sanitizeObject(body)
    return sanitized as T
  } catch (error) {
    context.logger.warn('Failed to parse request body', {}, error)
    return null
  }
}

/**
 * Validate UUID parameter
 */
export function validateUUIDParam(
  param: string | null | undefined,
  paramName: string,
  context: ApiContext
): string | null {
  if (!param) {
    context.logger.warn(`Missing required parameter: ${paramName}`)
    return null
  }

  if (!isValidUUID(param)) {
    context.logger.warn(`Invalid UUID for ${paramName}: ${param}`)
    return null
  }

  return param
}

/**
 * Get pagination parameters from URL
 */
export function getPaginationParams(req: NextRequest): {
  page: number
  limit: number
  offset: number
} {
  const url = req.nextUrl
  const page = Math.max(0, parseInt(url.searchParams.get('page') || '0', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)))
  const offset = page * limit

  return { page, limit, offset }
}

/**
 * Get sort parameters from URL
 */
export function getSortParams(
  req: NextRequest,
  allowedFields: string[],
  defaultField = 'created_at',
  defaultOrder: 'asc' | 'desc' = 'desc'
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const url = req.nextUrl
  let sortBy = url.searchParams.get('sort_by') || defaultField
  const sortOrder = (url.searchParams.get('sort_order') || defaultOrder) as 'asc' | 'desc'

  // Validate sort field
  if (!allowedFields.includes(sortBy)) {
    sortBy = defaultField
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(sortOrder)) {
    return { sortBy, sortOrder: defaultOrder }
  }

  return { sortBy, sortOrder }
}

/**
 * Get filter parameters from URL
 */
export function getFilterParams(
  req: NextRequest,
  allowedFilters: string[]
): Record<string, string> {
  const url = req.nextUrl
  const filters: Record<string, string> = {}

  for (const filter of allowedFilters) {
    const value = url.searchParams.get(filter)
    if (value) {
      filters[filter] = value
    }
  }

  return filters
}

/**
 * Wrap API handler with common functionality
 */
export function withApiHandler<T>(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    const context = createApiContext(req)
    const timer = createTimer()

    // Log incoming request
    context.logger.info(`${req.method} ${req.nextUrl.pathname}`, {
      userAgent: req.headers.get('user-agent') || undefined,
    })

    try {
      const response = await handler(req, context)

      // Log response
      timer.log(context.logger, `${req.method} ${req.nextUrl.pathname} completed`, {
        statusCode: response.status,
      })

      // Add request ID to response headers
      response.headers.set('x-request-id', context.requestId)

      return response
    } catch (error) {
      // Log and return error response
      context.logger.error(
        `${req.method} ${req.nextUrl.pathname} failed`,
        { durationMs: timer.elapsed() },
        error
      )

      return errors.serverError(context, error) as NextResponse<ApiResponse<T>>
    }
  }
}

/**
 * Create typed API route handlers
 */
export function createApiRoute<T>(handlers: {
  GET?: (req: NextRequest, context: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
  POST?: (req: NextRequest, context: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
  PUT?: (req: NextRequest, context: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
  PATCH?: (req: NextRequest, context: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
  DELETE?: (req: NextRequest, context: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
}) {
  const wrappedHandlers: Record<
    string,
    (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
  > = {}

  for (const [method, handler] of Object.entries(handlers)) {
    if (handler) {
      wrappedHandlers[method] = withApiHandler(handler)
    }
  }

  return wrappedHandlers
}

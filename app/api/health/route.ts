// AIDEV-NOTE: Health check endpoint for monitoring OpenRouter and Supabase connectivity
// Returns status of all critical dependencies for the AI chat system

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { metricsCollector } from '@/lib/ai/metrics'

// AIDEV-NOTE: Health check response interface
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    supabase: ServiceCheck
    openrouter: ServiceCheck
  }
  metrics?: {
    activeRequests: number
    latencyP50: number
    latencyP95: number
    latencyP99: number
  }
}

interface ServiceCheck {
  status: 'up' | 'down'
  latencyMs?: number
  error?: string
}

// AIDEV-NOTE: Track server start time for uptime calculation
const startTime = Date.now()

// AIDEV-NOTE: Timeout for external service checks
const CHECK_TIMEOUT_MS = 5000

/**
 * Check Supabase connectivity
 * AIDEV-NOTE: Performs a simple query to verify database is accessible
 */
async function checkSupabase(): Promise<ServiceCheck> {
  const start = Date.now()

  try {
    const supabase = await createClient()

    // AIDEV-NOTE: Simple query to check connectivity - uses establishments table
    const { error } = await supabase
      .from('establishments')
      .select('id')
      .limit(1)

    const latencyMs = Date.now() - start

    if (error) {
      logger.warn('Supabase health check failed', { error: error.message, latencyMs })
      return {
        status: 'down',
        latencyMs,
        error: error.message,
      }
    }

    return {
      status: 'up',
      latencyMs,
    }
  } catch (error) {
    const latencyMs = Date.now() - start
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Supabase health check error', { error: errorMessage, latencyMs })

    return {
      status: 'down',
      latencyMs,
      error: errorMessage,
    }
  }
}

/**
 * Check OpenRouter API connectivity
 * AIDEV-NOTE: Verifies OpenRouter API is accessible by fetching models list
 */
async function checkOpenRouter(): Promise<ServiceCheck> {
  const start = Date.now()

  try {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return {
        status: 'down',
        error: 'OPENROUTER_API_KEY not configured',
      }
    }

    // AIDEV-NOTE: Fetch models list as a lightweight health check
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Delivery App Health Check',
      },
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    })

    const latencyMs = Date.now() - start

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      logger.warn('OpenRouter health check failed', {
        status: response.status,
        error: errorText,
        latencyMs,
      })

      return {
        status: 'down',
        latencyMs,
        error: `HTTP ${response.status}: ${errorText}`,
      }
    }

    return {
      status: 'up',
      latencyMs,
    }
  } catch (error) {
    const latencyMs = Date.now() - start
    const errorMessage = error instanceof Error ? error.message : String(error)

    // AIDEV-NOTE: Handle timeout specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      logger.warn('OpenRouter health check timed out', { latencyMs })
      return {
        status: 'down',
        latencyMs,
        error: `Timeout after ${CHECK_TIMEOUT_MS}ms`,
      }
    }

    logger.error('OpenRouter health check error', { error: errorMessage, latencyMs })

    return {
      status: 'down',
      latencyMs,
      error: errorMessage,
    }
  }
}

/**
 * Health check endpoint
 * AIDEV-NOTE: Returns comprehensive health status of all dependencies
 *
 * @returns
 * - 200 OK: All services healthy
 * - 503 Service Unavailable: One or more services unhealthy
 */
export async function GET(): Promise<NextResponse<HealthCheckResult>> {
  const requestId = crypto.randomUUID()

  logger.debug('Health check started', { requestId })

  // AIDEV-NOTE: Run checks in parallel for faster response
  const [supabaseCheck, openrouterCheck] = await Promise.all([
    checkSupabase(),
    checkOpenRouter(),
  ])

  // AIDEV-NOTE: Get AI metrics for observability
  const latencyPercentiles = metricsCollector.getLatencyPercentiles()

  // AIDEV-NOTE: Determine overall health status
  const allHealthy = supabaseCheck.status === 'up' && openrouterCheck.status === 'up'
  const allUnhealthy = supabaseCheck.status === 'down' && openrouterCheck.status === 'down'

  let status: HealthCheckResult['status']
  if (allHealthy) {
    status = 'healthy'
  } else if (allUnhealthy) {
    status = 'unhealthy'
  } else {
    status = 'degraded'
  }

  const result: HealthCheckResult = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      supabase: supabaseCheck,
      openrouter: openrouterCheck,
    },
    metrics: {
      activeRequests: metricsCollector.getActiveRequestCount(),
      latencyP50: latencyPercentiles.p50,
      latencyP95: latencyPercentiles.p95,
      latencyP99: latencyPercentiles.p99,
    },
  }

  const httpStatus = allHealthy ? 200 : 503

  logger.info('Health check completed', {
    requestId,
    status,
    supabase: supabaseCheck.status,
    openrouter: openrouterCheck.status,
    httpStatus,
  })

  return NextResponse.json(result, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Request-Id': requestId,
    },
  })
}

/**
 * HEAD request for lightweight health check
 * AIDEV-NOTE: Can be used by load balancers for quick status checks
 */
export async function HEAD(): Promise<NextResponse> {
  const [supabaseCheck, openrouterCheck] = await Promise.all([
    checkSupabase(),
    checkOpenRouter(),
  ])

  const allHealthy = supabaseCheck.status === 'up' && openrouterCheck.status === 'up'

  return new NextResponse(null, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

// AIDEV-NOTE: AI Error Handler for the delivery application
// Provides structured error handling for LLM timeouts, product availability, price changes, and store hours

import { logger } from '@/lib/logger'

// AIDEV-NOTE: Error codes for AI-related errors
export type AIErrorCode =
  | 'TIMEOUT'
  | 'PRODUCT_UNAVAILABLE'
  | 'PRICE_CHANGED'
  | 'STORE_CLOSED'
  | 'RATE_LIMITED'
  | 'MODEL_OVERLOADED'
  | 'INVALID_RESPONSE'
  | 'CONTEXT_TOO_LONG'
  | 'UNKNOWN'

// AIDEV-NOTE: User-friendly error messages in Portuguese (Brazil)
export const errorMessages: Record<AIErrorCode, string> = {
  TIMEOUT: 'Desculpe, estou um pouco lento. Pode tentar novamente?',
  PRODUCT_UNAVAILABLE: 'Este produto nao esta mais disponivel no momento.',
  PRICE_CHANGED: 'O preco de alguns itens mudou. Por favor, revise seu carrinho.',
  STORE_CLOSED: 'O estabelecimento acabou de fechar. Seu pedido foi salvo e voce pode finaliza-lo quando abrirmos novamente.',
  RATE_LIMITED: 'Estamos recebendo muitas solicitacoes. Por favor, aguarde um momento e tente novamente.',
  MODEL_OVERLOADED: 'Nosso assistente esta muito ocupado no momento. Tente novamente em alguns segundos.',
  INVALID_RESPONSE: 'Desculpe, nao consegui processar sua solicitacao. Pode reformular?',
  CONTEXT_TOO_LONG: 'Nossa conversa ficou muito longa. Vamos comecar uma nova?',
  UNKNOWN: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
}

// AIDEV-NOTE: Detailed error context for debugging and logging
export interface AIErrorContext {
  /** Original error message */
  originalMessage?: string
  /** Request ID for correlation */
  requestId?: string
  /** Tenant ID */
  tenantId?: string
  /** Session ID */
  sessionId?: string
  /** Product IDs affected (for PRODUCT_UNAVAILABLE) */
  productIds?: string[]
  /** Price changes (for PRICE_CHANGED) */
  priceChanges?: Array<{
    productId: string
    productName: string
    oldPrice: number
    newPrice: number
  }>
  /** Store hours (for STORE_CLOSED) */
  storeHours?: {
    openTime: string
    closeTime: string
    timezone: string
  }
  /** Retry after seconds (for RATE_LIMITED/TIMEOUT) */
  retryAfterMs?: number
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Custom AI Error class for structured error handling
 * AIDEV-NOTE: Extends Error with additional context for AI-specific errors
 */
export class AIError extends Error {
  public readonly code: AIErrorCode
  public readonly userMessage: string
  public readonly retryable: boolean
  public readonly context: AIErrorContext
  public readonly timestamp: Date

  constructor(
    message: string,
    code: AIErrorCode,
    userMessage?: string,
    retryable: boolean = false,
    context: AIErrorContext = {}
  ) {
    super(message)
    this.name = 'AIError'
    this.code = code
    this.userMessage = userMessage || errorMessages[code]
    this.retryable = retryable
    this.context = context
    this.timestamp = new Date()

    // AIDEV-NOTE: Maintains proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIError)
    }
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      error: true,
      code: this.code,
      message: this.userMessage,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      ...(this.context.retryAfterMs && { retryAfterMs: this.context.retryAfterMs }),
      ...(this.context.priceChanges && { priceChanges: this.context.priceChanges }),
      ...(this.context.storeHours && { storeHours: this.context.storeHours }),
    }
  }
}

/**
 * Handle and convert unknown errors to AIError
 * AIDEV-NOTE: Main entry point for error handling - detects error type and creates appropriate AIError
 */
export function handleAIError(error: unknown, context: AIErrorContext = {}): AIError {
  // Already an AIError, enhance with context if needed
  if (error instanceof AIError) {
    return new AIError(
      error.message,
      error.code,
      error.userMessage,
      error.retryable,
      { ...error.context, ...context }
    )
  }

  // Handle standard Error types
  if (error instanceof Error) {
    // AIDEV-NOTE: Detect timeout errors (AbortError, timeout in message)
    if (
      error.name === 'AbortError' ||
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('timed out')
    ) {
      return new AIError(
        `OpenRouter timeout: ${error.message}`,
        'TIMEOUT',
        errorMessages.TIMEOUT,
        true,
        { ...context, originalMessage: error.message, retryAfterMs: 3000 }
      )
    }

    // AIDEV-NOTE: Detect rate limiting errors
    if (
      error.message.toLowerCase().includes('rate limit') ||
      error.message.toLowerCase().includes('too many requests') ||
      error.message.includes('429')
    ) {
      return new AIError(
        `Rate limited: ${error.message}`,
        'RATE_LIMITED',
        errorMessages.RATE_LIMITED,
        true,
        { ...context, originalMessage: error.message, retryAfterMs: 10000 }
      )
    }

    // AIDEV-NOTE: Detect model overload
    if (
      error.message.toLowerCase().includes('overloaded') ||
      error.message.includes('503')
    ) {
      return new AIError(
        `Model overloaded: ${error.message}`,
        'MODEL_OVERLOADED',
        errorMessages.MODEL_OVERLOADED,
        true,
        { ...context, originalMessage: error.message, retryAfterMs: 5000 }
      )
    }

    // AIDEV-NOTE: Detect context length errors
    if (
      error.message.toLowerCase().includes('context length') ||
      error.message.toLowerCase().includes('too many tokens') ||
      error.message.toLowerCase().includes('maximum context')
    ) {
      return new AIError(
        `Context too long: ${error.message}`,
        'CONTEXT_TOO_LONG',
        errorMessages.CONTEXT_TOO_LONG,
        false,
        { ...context, originalMessage: error.message }
      )
    }

    // Generic error
    return new AIError(
      error.message,
      'UNKNOWN',
      errorMessages.UNKNOWN,
      true,
      { ...context, originalMessage: error.message }
    )
  }

  // Handle non-Error types
  return new AIError(
    String(error),
    'UNKNOWN',
    errorMessages.UNKNOWN,
    true,
    { ...context, originalMessage: String(error) }
  )
}

/**
 * Create a product unavailable error
 * AIDEV-NOTE: Use when products in cart are no longer available
 */
export function createProductUnavailableError(
  productIds: string[],
  productNames?: string[],
  context: Omit<AIErrorContext, 'productIds'> = {}
): AIError {
  const names = productNames?.join(', ') || productIds.join(', ')
  const plural = productIds.length > 1 ? 's' : ''
  const message = `Produto${plural} indisponivel${plural}: ${names}`

  return new AIError(
    message,
    'PRODUCT_UNAVAILABLE',
    productIds.length > 1
      ? 'Alguns produtos do seu carrinho nao estao mais disponiveis.'
      : errorMessages.PRODUCT_UNAVAILABLE,
    false,
    { ...context, productIds }
  )
}

/**
 * Create a price changed error
 * AIDEV-NOTE: Use when product prices have changed since user added to cart
 */
export function createPriceChangedError(
  priceChanges: AIErrorContext['priceChanges'],
  context: Omit<AIErrorContext, 'priceChanges'> = {}
): AIError {
  const changesDescription = priceChanges
    ?.map((c) => `${c.productName}: R$ ${c.oldPrice.toFixed(2)} -> R$ ${c.newPrice.toFixed(2)}`)
    .join('; ')

  return new AIError(
    `Price changes detected: ${changesDescription}`,
    'PRICE_CHANGED',
    errorMessages.PRICE_CHANGED,
    false,
    { ...context, priceChanges }
  )
}

/**
 * Create a store closed error with fallback information
 * AIDEV-NOTE: Use when establishment closes during order process
 */
export function createStoreClosedError(
  storeHours: AIErrorContext['storeHours'],
  context: Omit<AIErrorContext, 'storeHours'> = {}
): AIError {
  const hoursInfo = storeHours
    ? `Horario de funcionamento: ${storeHours.openTime} - ${storeHours.closeTime}`
    : 'Horario de funcionamento nao disponivel'

  const userMessage = `O estabelecimento acabou de fechar. ${hoursInfo}. Seu pedido foi salvo e voce pode finaliza-lo quando abrirmos novamente.`

  return new AIError(
    `Store closed: ${hoursInfo}`,
    'STORE_CLOSED',
    userMessage,
    false,
    { ...context, storeHours }
  )
}

/**
 * Create a timeout error with retry suggestion
 * AIDEV-NOTE: Use when LLM request times out
 */
export function createTimeoutError(
  durationMs: number,
  context: AIErrorContext = {}
): AIError {
  return new AIError(
    `Request timed out after ${durationMs}ms`,
    'TIMEOUT',
    errorMessages.TIMEOUT,
    true,
    { ...context, retryAfterMs: 3000 }
  )
}

/**
 * Error handler middleware for AI chat endpoints
 * AIDEV-NOTE: Wraps async handlers to catch and transform errors
 */
export function withErrorHandler<T>(
  handler: (context: AIErrorContext) => Promise<T>,
  context: AIErrorContext = {}
): Promise<T> {
  return handler(context).catch((error) => {
    const aiError = handleAIError(error, context)

    // Log the error with full context
    logger.error('AI Error occurred', {
      requestId: context.requestId,
      tenantId: context.tenantId,
      sessionId: context.sessionId,
      errorCode: aiError.code,
      errorMessage: aiError.message,
      userMessage: aiError.userMessage,
      retryable: aiError.retryable,
    }, error)

    throw aiError
  })
}

/**
 * Check if an error is retryable
 * AIDEV-NOTE: Helper to determine if operation should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AIError) {
    return error.retryable
  }
  // Default to retryable for unknown errors
  return true
}

/**
 * Get retry delay for an error
 * AIDEV-NOTE: Returns suggested delay before retry in milliseconds
 */
export function getRetryDelay(error: unknown): number {
  if (error instanceof AIError && error.context.retryAfterMs) {
    return error.context.retryAfterMs
  }
  // Default retry delay
  return 3000
}

/**
 * Format error for API response
 * AIDEV-NOTE: Creates a consistent error response format
 */
export function formatErrorResponse(error: unknown): {
  error: true
  code: AIErrorCode
  message: string
  retryable: boolean
  retryAfterMs?: number
} {
  const aiError = error instanceof AIError ? error : handleAIError(error)

  return {
    error: true,
    code: aiError.code,
    message: aiError.userMessage,
    retryable: aiError.retryable,
    ...(aiError.context.retryAfterMs && { retryAfterMs: aiError.context.retryAfterMs }),
  }
}

/**
 * Retry helper with exponential backoff
 * AIDEV-NOTE: Automatically retries retryable errors with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    context?: AIErrorContext
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000, context = {} } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw handleAIError(error, context)
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
      const jitter = Math.random() * 0.1 * delay // Add 10% jitter

      logger.warn('Retrying after error', {
        ...context,
        attempt: attempt + 1,
        maxRetries,
        delayMs: delay + jitter,
        errorMessage: error instanceof Error ? error.message : String(error),
      })

      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
    }
  }

  throw handleAIError(lastError, context)
}

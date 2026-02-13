'use client'

// AIDEV-NOTE: API error handling hook with retry and exponential backoff
// Provides standardized error handling for API calls

import { useState, useCallback, useRef } from 'react'

// Error types
export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'CONFLICT_ERROR'
  | 'UNKNOWN_ERROR'

export interface ApiError {
  code: ApiErrorCode
  message: string
  status?: number
  details?: Record<string, unknown>
  retryable: boolean
}

export interface UseApiErrorOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Initial delay in ms for exponential backoff (default: 1000) */
  initialDelay?: number
  /** Maximum delay in ms (default: 30000) */
  maxDelay?: number
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number
  /** Whether to add jitter to delays (default: true) */
  jitter?: boolean
  /** Callback when error occurs */
  onError?: (error: ApiError, attempt: number) => void
  /** Callback when retry is attempted */
  onRetry?: (error: ApiError, attempt: number, delay: number) => void
  /** Callback when all retries are exhausted */
  onRetryExhausted?: (error: ApiError) => void
}

export interface UseApiErrorReturn<T> {
  /** Execute an async function with error handling and retries */
  execute: (fn: () => Promise<T>) => Promise<T | null>
  /** Current error state */
  error: ApiError | null
  /** Whether a request is in progress */
  isLoading: boolean
  /** Current retry attempt (0 if not retrying) */
  retryAttempt: number
  /** Clear the error state */
  clearError: () => void
  /** Manually retry the last failed operation */
  retry: () => Promise<T | null>
  /** Cancel any ongoing retry */
  cancelRetry: () => void
}

/**
 * Parses an error and returns a standardized ApiError object
 */
export function parseApiError(err: unknown): ApiError {
  // Handle fetch errors (network issues)
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Erro de conexao. Verifique sua internet.',
      retryable: true,
    }
  }

  // Handle abort errors (timeout)
  if (err instanceof DOMException && err.name === 'AbortError') {
    return {
      code: 'TIMEOUT_ERROR',
      message: 'A requisicao demorou muito. Tente novamente.',
      retryable: true,
    }
  }

  // Handle Response errors (fetch responses that aren't ok)
  if (err instanceof Response || (err && typeof err === 'object' && 'status' in err)) {
    const response = err as Response
    const status = response.status

    if (status === 401) {
      return {
        code: 'AUTH_ERROR',
        message: 'Sessao expirada. Faca login novamente.',
        status,
        retryable: false,
      }
    }

    if (status === 403) {
      return {
        code: 'FORBIDDEN_ERROR',
        message: 'Voce nao tem permissao para esta acao.',
        status,
        retryable: false,
      }
    }

    if (status === 404) {
      return {
        code: 'NOT_FOUND_ERROR',
        message: 'O recurso solicitado nao foi encontrado.',
        status,
        retryable: false,
      }
    }

    if (status === 409) {
      return {
        code: 'CONFLICT_ERROR',
        message: 'Conflito de dados. O registro pode ter sido alterado por outro usuario.',
        status,
        retryable: false,
      }
    }

    if (status === 422) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Dados invalidos. Verifique os campos e tente novamente.',
        status,
        retryable: false,
      }
    }

    if (status === 429) {
      return {
        code: 'RATE_LIMIT_ERROR',
        message: 'Muitas requisicoes. Aguarde um momento e tente novamente.',
        status,
        retryable: true,
      }
    }

    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Erro no servidor. Tente novamente em alguns instantes.',
        status,
        retryable: true,
      }
    }
  }

  // Handle Error objects with message
  if (err instanceof Error) {
    // Check for specific error types
    if (err.message.includes('network') || err.message.includes('Network')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Erro de conexao. Verifique sua internet.',
        retryable: true,
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: err.message || 'Ocorreu um erro inesperado.',
      retryable: false,
    }
  }

  // Handle plain objects with error info
  if (err && typeof err === 'object') {
    const errorObj = err as Record<string, unknown>
    return {
      code: (errorObj.code as ApiErrorCode) || 'UNKNOWN_ERROR',
      message: (errorObj.message as string) || 'Ocorreu um erro inesperado.',
      details: errorObj.details as Record<string, unknown>,
      retryable: false,
    }
  }

  // Fallback for unknown error types
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ocorreu um erro inesperado.',
    retryable: false,
  }
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
  jitter: boolean
): number {
  // Exponential backoff: initialDelay * multiplier^attempt
  let delay = initialDelay * Math.pow(multiplier, attempt)

  // Add jitter (random factor between 0.5 and 1.5)
  if (jitter) {
    const jitterFactor = 0.5 + Math.random()
    delay = delay * jitterFactor
  }

  // Cap at max delay
  return Math.min(delay, maxDelay)
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Hook for handling API errors with automatic retries and exponential backoff
 */
export function useApiError<T = unknown>(
  options: UseApiErrorOptions = {}
): UseApiErrorReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    onError,
    onRetry,
    onRetryExhausted,
  } = options

  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)

  const lastFnRef = useRef<(() => Promise<T>) | null>(null)
  const cancelRef = useRef(false)

  const clearError = useCallback(() => {
    setError(null)
    setRetryAttempt(0)
  }, [])

  const cancelRetry = useCallback(() => {
    cancelRef.current = true
  }, [])

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      lastFnRef.current = fn
      cancelRef.current = false
      setIsLoading(true)
      setError(null)
      setRetryAttempt(0)

      let attempt = 0

      while (attempt <= maxRetries) {
        try {
          const result = await fn()
          setIsLoading(false)
          setRetryAttempt(0)
          return result
        } catch (err) {
          const apiError = parseApiError(err)

          // Call error callback
          onError?.(apiError, attempt)

          // If error is not retryable or we've exhausted retries
          if (!apiError.retryable || attempt >= maxRetries || cancelRef.current) {
            setError(apiError)
            setIsLoading(false)

            if (attempt >= maxRetries && apiError.retryable) {
              onRetryExhausted?.(apiError)
            }

            return null
          }

          // Calculate retry delay
          const delay = calculateDelay(
            attempt,
            initialDelay,
            maxDelay,
            backoffMultiplier,
            jitter
          )

          // Update retry attempt state
          attempt++
          setRetryAttempt(attempt)

          // Call retry callback
          onRetry?.(apiError, attempt, delay)

          // Wait before retrying
          await sleep(delay)

          // Check if cancelled during sleep
          if (cancelRef.current) {
            setError(apiError)
            setIsLoading(false)
            return null
          }
        }
      }

      setIsLoading(false)
      return null
    },
    [
      maxRetries,
      initialDelay,
      maxDelay,
      backoffMultiplier,
      jitter,
      onError,
      onRetry,
      onRetryExhausted,
    ]
  )

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastFnRef.current) {
      return execute(lastFnRef.current)
    }
    return null
  }, [execute])

  return {
    execute,
    error,
    isLoading,
    retryAttempt,
    clearError,
    retry,
    cancelRetry,
  }
}

/**
 * Get a user-friendly error message based on error code
 */
export function getErrorMessage(error: ApiError | null): string {
  if (!error) return ''
  return error.message
}

/**
 * Check if an error should trigger a redirect to login
 */
export function shouldRedirectToLogin(error: ApiError | null): boolean {
  return error?.code === 'AUTH_ERROR'
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: ApiError | null): boolean {
  return error?.retryable ?? false
}

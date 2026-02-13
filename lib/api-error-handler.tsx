// TASK-060: API error handler utilities
// AIDEV-NOTE: Centralized error handling with toast notifications

'use client'

import * as React from 'react'
import type { ApiError } from '@/hooks/use-api-error'

// Toast function type (compatible with sonner/toast)
export type ToastFunction = (
  message: string,
  options?: {
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
    duration?: number
  }
) => void

interface ErrorHandlerContext {
  toast?: ToastFunction
  onError?: (error: ApiError) => void
}

let errorHandlerContext: ErrorHandlerContext = {}

/**
 * Initialize error handler with toast function
 * Call this once in your app root
 */
export function initErrorHandler(context: ErrorHandlerContext): void {
  errorHandlerContext = context
}

/**
 * Handle API error with appropriate user feedback
 */
export function handleApiError(error: ApiError | unknown): void {
  const apiError = normalizeApiError(error)

  // Call custom error handler
  errorHandlerContext.onError?.(apiError)

  // Show toast if available
  if (errorHandlerContext.toast) {
    const toast = errorHandlerContext.toast

    switch (apiError.code) {
      case 'NETWORK_ERROR':
        toast(apiError.message, {
          description: 'Verifique sua conexao e tente novamente.',
          duration: 5000,
        })
        break

      case 'TIMEOUT_ERROR':
        toast(apiError.message, {
          description: 'A requisicao demorou muito. Tente novamente.',
          duration: 5000,
        })
        break

      case 'AUTH_ERROR':
        toast('Sessao expirada', {
          description: 'Por favor, faca login novamente.',
          action: {
            label: 'Fazer login',
            onClick: () => {
              window.location.href = '/login'
            },
          },
        })
        break

      case 'FORBIDDEN_ERROR':
        toast('Sem permissao', {
          description: apiError.message,
          duration: 5000,
        })
        break

      case 'NOT_FOUND_ERROR':
        toast('Nao encontrado', {
          description: apiError.message,
          duration: 4000,
        })
        break

      case 'RATE_LIMIT_ERROR':
        toast('Muitas requisicoes', {
          description: apiError.message,
          duration: 5000,
        })
        break

      case 'VALIDATION_ERROR':
        toast('Dados invalidos', {
          description: apiError.message,
          duration: 4000,
        })
        break

      case 'SERVER_ERROR':
        toast('Erro no servidor', {
          description: 'Tente novamente em alguns instantes.',
          duration: 5000,
        })
        break

      default:
        toast('Erro', {
          description: apiError.message,
          duration: 4000,
        })
    }
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]:', apiError)
  }
}

/**
 * Normalize error to ApiError type
 */
function normalizeApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error && typeof error === 'object' && 'code' in error) {
    return error as ApiError
  }

  // Error object
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Ocorreu um erro inesperado.',
      retryable: false,
    }
  }

  // String error
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN_ERROR',
      message: error,
      retryable: false,
    }
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ocorreu um erro inesperado.',
    retryable: false,
  }
}

/**
 * Show error toast (alias for backward compatibility)
 */
export function showErrorToast(
  error: ApiError | unknown,
  customMessage?: string
): void {
  const apiError = normalizeApiError(error)

  if (errorHandlerContext.toast) {
    const message = customMessage || apiError.message
    errorHandlerContext.toast(message, {
      description: apiError.code !== 'UNKNOWN_ERROR' ? undefined : apiError.message,
    })
  }
}

/**
 * Show success toast
 */
export function showSuccessToast(
  message: string,
  description?: string
): void {
  if (errorHandlerContext.toast) {
    errorHandlerContext.toast(message, { description })
  }
}

/**
 * Show info toast
 */
export function showInfoToast(
  message: string,
  description?: string
): void {
  if (errorHandlerContext.toast) {
    errorHandlerContext.toast(message, { description })
  }
}

/**
 * React hook to access error handler
 */
export function useErrorHandler() {
  return {
    handleApiError,
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    initErrorHandler,
  }
}

/**
 * Error boundary fallback component factory
 */
export interface ErrorFallbackConfig {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
}

// AIDEV-NOTE: Error fallback component for API errors
function ApiErrorFallback({
  error,
  resetErrorBoundary,
  title,
  message,
  showRetry,
  onRetry,
}: {
  error?: Error | null
  resetErrorBoundary?: () => void
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
}) {
  const {
    title: defaultTitle = 'Algo deu errado',
    message: defaultMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    showRetry: defaultShowRetry = true,
    onRetry: defaultOnRetry,
  } = {
    title,
    message,
    showRetry,
    onRetry,
  }

  const handleRetry = () => {
    if (defaultOnRetry) {
      defaultOnRetry()
    }
    if (resetErrorBoundary) {
      resetErrorBoundary()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <svg
          className="h-8 w-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold mb-2">{defaultTitle}</h2>

      <p className="text-muted-foreground mb-6 max-w-md">{defaultMessage}</p>

      {defaultShowRetry && (
        <button
          onClick={handleRetry}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function createErrorFallback(config: ErrorFallbackConfig = {}) {
  return function ErrorFallback(props: {
    error?: Error | null
    resetErrorBoundary?: () => void
  }) {
    return <ApiErrorFallback {...props} {...config} />
  }
}

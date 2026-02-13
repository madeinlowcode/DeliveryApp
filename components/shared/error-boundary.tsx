'use client'

// AIDEV-NOTE: Error Boundary component for catching React render errors
// Provides graceful error handling and recovery options

import * as React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode
  /** Custom fallback UI */
  fallback?: React.ReactNode
  /** Custom error handler */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Whether to show error details in development */
  showDetails?: boolean
  /** Custom reset handler */
  onReset?: () => void
  /** CSS class name */
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  showDetails,
  onReset,
  onNavigateHome,
  className,
}: {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails?: boolean
  onReset?: () => void
  onNavigateHome?: () => void
  className?: string
}) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[300px]',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>

      <p className="text-muted-foreground mb-6 max-w-md">
        Ocorreu um erro inesperado. Por favor, tente novamente ou volte para a
        pagina inicial.
      </p>

      <div className="flex gap-3">
        {onReset && (
          <Button onClick={onReset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
        {onNavigateHome && (
          <Button onClick={onNavigateHome} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Pagina inicial
          </Button>
        )}
      </div>

      {/* Error details for development */}
      {(showDetails || isDev) && error && (
        <div className="mt-8 w-full max-w-2xl">
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Detalhes tecnicos
            </summary>
            <div className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
              <p className="text-sm font-mono text-destructive mb-2">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
              {errorInfo?.componentStack && (
                <>
                  <p className="text-sm font-medium mt-4 mb-2">Component Stack:</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

/**
 * Error Boundary component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  navigateHome = (): void => {
    window.location.href = '/'
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showDetails={this.props.showDetails}
          onReset={this.resetErrorBoundary}
          onNavigateHome={this.navigateHome}
          className={this.props.className}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Hook to use error boundary imperatively
 * Useful for catching errors in event handlers or async code
 */
export function useErrorBoundary(): {
  showBoundary: (error: Error) => void
} {
  const [, setError] = React.useState<Error | null>(null)

  const showBoundary = React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])

  return { showBoundary }
}

/**
 * Higher-order component to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  Wrapped.displayName = `WithErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return Wrapped
}

/**
 * Simple error fallback component for smaller sections
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  className,
}: {
  error?: Error | null
  resetErrorBoundary?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'p-4 border border-destructive/20 bg-destructive/5 rounded-lg',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar este conteudo
          </p>
          {error && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {error.message}
            </p>
          )}
          {resetErrorBoundary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetErrorBoundary}
              className="mt-2 -ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

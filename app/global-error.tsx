'use client'

// AIDEV-NOTE: Global error boundary for Next.js App Router
// Catches uncaught errors in the application and displays a recovery UI
// AIDEV-NOTE: T-016 - Error Boundary global implementation

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Global error component
 * Displayed when an uncaught error occurs anywhere in the app
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // AIDEV-NOTE: Log error to error reporting service in production
    console.error('Global error caught:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-destructive text-2xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try again or contact support if the problem
              persists.
            </p>
            {error.digest && (
              <p className="text-muted-foreground text-xs">Error ID: {error.digest}</p>
            )}
            <div className="flex justify-center gap-2 pt-4">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

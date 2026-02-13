"use client"

// TASK-032: Tool error display component
// AIDEV-NOTE: Shows error messages with retry functionality

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// AIDEV-NOTE: Error type for better handling
export interface ToolError {
  code?: string
  message: string
  details?: string
  retryable?: boolean
  fatal?: boolean
}

interface ToolErrorProps {
  error: ToolError | string
  onRetry?: () => void | Promise<void>
  onDismiss?: () => void
  variant?: "full" | "compact" | "inline" | "banner"
  className?: string
}

export function ToolError({
  error,
  onRetry,
  onDismiss,
  variant = "full",
  className,
}: ToolErrorProps) {
  // Normalize error to ToolError type
  const errorObj: ToolError =
    typeof error === "string"
      ? { message: error, retryable: !!onRetry }
      : error

  const {
    code,
    message,
    details,
    retryable = !!onRetry,
    fatal = false,
  } = errorObj

  if (variant === "inline") {
    return (
      <InlineError
        message={message}
        onRetry={retryable ? onRetry : undefined}
        className={className}
      />
    )
  }

  if (variant === "banner") {
    return (
      <BannerError
        message={message}
        code={code}
        onDismiss={onDismiss}
        className={className}
      />
    )
  }

  if (variant === "compact") {
    return (
      <CompactError
        message={message}
        details={details}
        onRetry={retryable ? onRetry : undefined}
        onDismiss={onDismiss}
        className={className}
      />
    )
  }

  return (
    <FullError
      code={code}
      message={message}
      details={details}
      onRetry={retryable ? onRetry : undefined}
      onDismiss={onDismiss}
      fatal={fatal}
      className={className}
    />
  )
}

// AIDEV-NOTE: Full error card with details
function FullError({
  code,
  message,
  details,
  onRetry,
  onDismiss,
  fatal,
  className,
}: {
  code?: string
  message: string
  details?: string
  onRetry?: () => void | Promise<void>
  onDismiss?: () => void
  fatal?: boolean
  className?: string
}) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = async () => {
    if (!onRetry) return

    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Card
      className={cn(
        "border-destructive/50 bg-destructive/5",
        fatal && "border-destructive",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>

            <div>
              <CardTitle className="text-destructive">
                {fatal ? "Erro critico" : "Ocorreu um erro"}
              </CardTitle>
              {code && (
                <CardDescription className="mt-1">
                  Codigo: {code}
                </CardDescription>
              )}
            </div>
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8"
              aria-label="Dispensar erro"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">{message}</p>

        {details && (
          <div className="bg-background rounded-lg p-3 text-sm text-muted-foreground">
            {details}
          </div>
        )}

        {onRetry && !fatal && (
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Tentando novamente...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                </svg>
                Tentar novamente
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Compact error for smaller spaces
function CompactError({
  message,
  details,
  onRetry,
  onDismiss,
  className,
}: {
  message: string
  details?: string
  onRetry?: () => void | Promise<void>
  onDismiss?: () => void
  className?: string
}) {
  return (
    <Alert variant="destructive" className={cn("", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      <AlertDescription className="flex items-center justify-between gap-2">
        <span className="flex-1">{message}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-7 px-2"
            >
              Tentar
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-7 w-7"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// AIDEV-NOTE: Inline error for chat messages
function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void | Promise<void>
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-destructive py-1 px-2 rounded bg-destructive/10",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="underline hover:no-underline text-xs"
        >
          Tentar
        </button>
      )}
    </div>
  )
}

// AIDEV-NOTE: Banner error for top of page
function BannerError({
  message,
  code,
  onDismiss,
  className,
}: {
  message: string
  code?: string
  onDismiss?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-3",
        className
      )}
    >
      <div className="container max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          <span className="text-sm font-medium">
            {message}
            {code && <span className="ml-2 opacity-70">({code})</span>}
          </span>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8 text-destructive-foreground hover:bg-destructive-foreground/10"
            aria-label="Dispensar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  )
}

// AIDEV-NOTE: Helper to create error from exception
export function createErrorFromException(err: unknown): ToolError {
  if (err instanceof Error) {
    return {
      message: err.message,
      details: err.stack,
      retryable: true,
    }
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    return {
      message: String(err.message),
      code: "code" in err ? String(err.code) : undefined,
      retryable: true,
    }
  }

  return {
    message: "Ocorreu um erro inesperado",
    retryable: true,
  }
}

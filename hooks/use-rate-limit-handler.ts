// TASK-073: Rate limit handler hook
// AIDEV-NOTE: Gracefully handles 429 rate limit errors with retry logic

'use client'

import * as React from 'react'
import type { ApiError } from './use-api-error'

interface RateLimitInfo {
  /** Timestamp when the rate limit will reset */
  resetAt: Date
  /** Number of seconds until reset */
  retryAfter: number
  /** Whether currently rate limited */
  isRateLimited: boolean
}

interface UseRateLimitHandlerOptions {
  /** Callback when rate limit is hit */
  onRateLimit?: (info: RateLimitInfo) => void
  /** Callback when rate limit expires */
  onRateLimitExpire?: () => void
  /** Show countdown timer */
  showCountdown?: boolean
}

interface UseRateLimitHandlerReturn {
  /** Current rate limit info */
  rateLimitInfo: RateLimitInfo | null
  /** Check if an error is a rate limit error */
  isRateLimitError: (error: ApiError | null) => boolean
  /** Handle rate limit error from API response */
  handleRateLimit: (error: ApiError) => void
  /** Manually clear rate limit state */
  clearRateLimit: () => void
  /** Format remaining time as string */
  formatRemainingTime: () => string
}

/**
 * Hook to handle rate limiting (HTTP 429) gracefully
 * Tracks rate limit state and provides countdown/retry information
 *
 * @example
 * ```tsx
 * const { rateLimitInfo, handleRateLimit, clearRateLimit } = useRateLimitHandler({
 *   onRateLimit: (info) => toast.error(`Tente novamente em ${info.retryAfter}s`),
 *   onRateLimitExpire: () => toast.success('Voce pode fazer requisicoes novamente'),
 * })
 * ```
 */
export function useRateLimitHandler(
  options: UseRateLimitHandlerOptions = {}
): UseRateLimitHandlerReturn {
  const { onRateLimit, onRateLimitExpire, showCountdown = true } = options

  const [rateLimitInfo, setRateLimitInfo] =
    React.useState<RateLimitInfo | null>(null)

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Clear timers
  const clearTimers = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Clear rate limit state
  const clearRateLimit = React.useCallback(() => {
    clearTimers()
    setRateLimitInfo(null)
  }, [clearTimers])

  // Handle rate limit expiration
  React.useEffect(() => {
    if (!rateLimitInfo || !rateLimitInfo.isRateLimited) {
      return
    }

    const now = Date.now()
    const resetTime = rateLimitInfo.resetAt.getTime()

    // If already expired, clear immediately
    if (now >= resetTime) {
      clearRateLimit()
      onRateLimitExpire?.()
      return
    }

    // Set timeout to clear at reset time
    const timeUntilReset = resetTime - now
    timeoutRef.current = setTimeout(() => {
      clearRateLimit()
      onRateLimitExpire?.()
    }, timeUntilReset)

    // Update countdown every second if enabled
    if (showCountdown) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now()
        const remainingMs = resetTime - currentTime

        if (remainingMs <= 0) {
          clearTimers()
          setRateLimitInfo((prev) =>
            prev ? { ...prev, isRateLimited: false } : null
          )
        } else {
          setRateLimitInfo((prev) =>
            prev
              ? {
                  ...prev,
                  retryAfter: Math.ceil(remainingMs / 1000),
                }
              : null
          )
        }
      }, 1000)
    }

    return clearTimers
  }, [rateLimitInfo, showCountdown, clearTimers, clearRateLimit, onRateLimitExpire])

  // Check if error is a rate limit error
  const isRateLimitError = React.useCallback(
    (error: ApiError | null): boolean => {
      return error?.code === 'RATE_LIMIT_ERROR'
    },
    []
  )

  // Handle rate limit error
  const handleRateLimit = React.useCallback(
    (error: ApiError) => {
      if (!isRateLimitError(error)) {
        return
      }

      // Calculate reset time
      // Try to get from Retry-After header (via details), otherwise default to 60s
      const retryAfterSeconds =
        (error.details?.['retry-after'] as number) ??
        (error.details?.['retryAfter'] as number) ??
        60

      const resetAt = new Date(Date.now() + retryAfterSeconds * 1000)

      const info: RateLimitInfo = {
        resetAt,
        retryAfter: retryAfterSeconds,
        isRateLimited: true,
      }

      setRateLimitInfo(info)
      onRateLimit?.(info)
    },
    [isRateLimitError, onRateLimit]
  )

  // Format remaining time
  const formatRemainingTime = React.useCallback((): string => {
    if (!rateLimitInfo) {
      return '0s'
    }

    const now = Date.now()
    const remaining = Math.max(0, rateLimitInfo.resetAt.getTime() - now)

    const seconds = Math.ceil(remaining / 1000)

    if (seconds < 60) {
      return `${seconds}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}m ${remainingSeconds}s`
  }, [rateLimitInfo])

  return {
    rateLimitInfo,
    isRateLimitError,
    handleRateLimit,
    clearRateLimit,
    formatRemainingTime,
  }
}

/**
 * Get retry-after seconds from various sources
 */
export function getRetryAfterSeconds(
  error: ApiError | null
): number | null {
  if (!error || error.code !== 'RATE_LIMIT_ERROR') {
    return null
  }

  // Check details for retry-after
  if (error.details) {
    const retryAfter = (error.details['retry-after'] as number) ??
      (error.details['retryAfter'] as number)
    if (typeof retryAfter === 'number') {
      return retryAfter
    }

    // Check for RateLimit-Reset timestamp
    const resetAt = (error.details['rate-limit-reset'] as number) ??
      (error.details['rateLimitReset'] as number)
    if (typeof resetAt === 'number') {
      const resetDate = new Date(resetAt)
      const secondsUntilReset = Math.max(
        0,
        Math.ceil((resetDate.getTime() - Date.now()) / 1000)
      )
      return secondsUntilReset
    }
  }

  // Default to 60 seconds
  return 60
}

/**
 * Hook to automatically retry after rate limit
 */
interface UseAutoRetryAfterRateLimitOptions {
  /** Function to call when rate limit expires */
  onRetry: () => void | Promise<void>
  /** Whether auto-retry is enabled */
  enabled?: boolean
}

export function useAutoRetryAfterRateLimit({
  onRetry,
  enabled = true,
}: UseAutoRetryAfterRateLimitOptions) {
  const { rateLimitInfo, handleRateLimit, clearRateLimit } =
    useRateLimitHandler({
      onRateLimitExpire: async () => {
        if (enabled) {
          await onRetry()
        }
      },
    })

  React.useEffect(() => {
    // Auto-retry when rate limit expires
    if (rateLimitInfo && !rateLimitInfo.isRateLimited && enabled) {
      onRetry()
      clearRateLimit()
    }
  }, [rateLimitInfo, enabled, onRetry, clearRateLimit])

  return {
    handleRateLimit,
    clearRateLimit,
    rateLimitInfo,
  }
}

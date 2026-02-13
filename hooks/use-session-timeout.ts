'use client'

// AIDEV-SECURITY: Session timeout hook
// Automatically logs out users after 24 hours of inactivity

import { useEffect, useCallback, useRef } from 'react'

// Configuration constants
const DEFAULT_TIMEOUT_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const WARNING_BEFORE_MS = 5 * 60 * 1000 // 5 minutes warning before logout
const ACTIVITY_DEBOUNCE_MS = 30 * 1000 // Debounce activity updates (30 seconds)
const STORAGE_KEY = 'session_last_activity'

interface UseSessionTimeoutOptions {
  /** Timeout duration in milliseconds (default: 24 hours) */
  timeoutMs?: number
  /** Callback when session expires */
  onTimeout: () => void
  /** Callback before timeout (for warning) */
  onWarning?: () => void
  /** Warning time before timeout in ms (default: 5 minutes) */
  warningBeforeMs?: number
  /** Whether the timeout is enabled */
  enabled?: boolean
}

interface UseSessionTimeoutReturn {
  /** Reset the session timer */
  resetTimer: () => void
  /** Get remaining time until timeout in ms */
  getRemainingTime: () => number
  /** Check if session is about to expire (within warning period) */
  isExpiringSoon: () => boolean
  /** Manually trigger logout */
  logout: () => void
}

/**
 * Hook for managing session timeout with automatic logout
 * Tracks user activity and triggers logout after inactivity period
 */
export function useSessionTimeout(
  options: UseSessionTimeoutOptions
): UseSessionTimeoutReturn {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onTimeout,
    onWarning,
    warningBeforeMs = WARNING_BEFORE_MS,
    enabled = true,
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const activityThrottleRef = useRef<number>(0)

  // AIDEV-SECURITY: Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = null
    }
  }, [])

  // AIDEV-SECURITY: Handle session timeout
  const handleTimeout = useCallback(() => {
    clearTimers()
    // Clear stored activity timestamp
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    onTimeout()
  }, [clearTimers, onTimeout])

  // AIDEV-SECURITY: Handle warning before timeout
  const handleWarning = useCallback(() => {
    if (onWarning) {
      onWarning()
    }
  }, [onWarning])

  // AIDEV-SECURITY: Start the timeout timer
  const startTimer = useCallback(() => {
    clearTimers()

    if (!enabled) return

    const now = Date.now()
    lastActivityRef.current = now

    // Store activity timestamp for cross-tab sync
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, now.toString())
    }

    // Set warning timer
    if (onWarning && warningBeforeMs < timeoutMs) {
      const warningTime = timeoutMs - warningBeforeMs
      warningRef.current = setTimeout(handleWarning, warningTime)
    }

    // Set timeout timer
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs)
  }, [
    clearTimers,
    enabled,
    timeoutMs,
    warningBeforeMs,
    onWarning,
    handleWarning,
    handleTimeout,
  ])

  // AIDEV-SECURITY: Reset timer on activity (debounced)
  const resetTimer = useCallback(() => {
    const now = Date.now()

    // Debounce activity updates to avoid excessive timer resets
    if (now - activityThrottleRef.current < ACTIVITY_DEBOUNCE_MS) {
      return
    }

    activityThrottleRef.current = now
    startTimer()
  }, [startTimer])

  // Get remaining time until timeout
  const getRemainingTime = useCallback((): number => {
    const elapsed = Date.now() - lastActivityRef.current
    return Math.max(0, timeoutMs - elapsed)
  }, [timeoutMs])

  // Check if session is expiring soon
  const isExpiringSoon = useCallback((): boolean => {
    return getRemainingTime() <= warningBeforeMs
  }, [getRemainingTime, warningBeforeMs])

  // Manual logout
  const logout = useCallback(() => {
    handleTimeout()
  }, [handleTimeout])

  // AIDEV-SECURITY: Set up activity listeners
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ]

    // Add activity listeners
    const handleActivity = () => resetTimer()
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // AIDEV-SECURITY: Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const storedTime = parseInt(e.newValue, 10)
        if (storedTime > lastActivityRef.current) {
          // Another tab had activity, sync our timer
          lastActivityRef.current = storedTime
          startTimer()
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // AIDEV-SECURITY: Check for existing session on mount
    const storedActivity = localStorage.getItem(STORAGE_KEY)
    if (storedActivity) {
      const storedTime = parseInt(storedActivity, 10)
      const elapsed = Date.now() - storedTime

      if (elapsed >= timeoutMs) {
        // Session already expired
        handleTimeout()
        return
      }

      // Resume session with remaining time
      lastActivityRef.current = storedTime
      clearTimers()

      const remainingTime = timeoutMs - elapsed
      const warningTime = remainingTime - warningBeforeMs

      if (onWarning && warningTime > 0) {
        warningRef.current = setTimeout(handleWarning, warningTime)
      } else if (onWarning && warningTime <= 0) {
        // Already in warning period
        handleWarning()
      }

      timeoutRef.current = setTimeout(handleTimeout, remainingTime)
    } else {
      // Start fresh session
      startTimer()
    }

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      window.removeEventListener('storage', handleStorageChange)
      clearTimers()
    }
  }, [
    enabled,
    timeoutMs,
    warningBeforeMs,
    startTimer,
    resetTimer,
    clearTimers,
    handleTimeout,
    handleWarning,
    onWarning,
  ])

  return {
    resetTimer,
    getRemainingTime,
    isExpiringSoon,
    logout,
  }
}

/**
 * Format remaining time for display
 * @param ms - Time in milliseconds
 * @returns Formatted string like "5m 30s" or "23h 59m"
 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '0s'

  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor(ms / (1000 * 60 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

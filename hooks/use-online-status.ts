// TASK-061: Online status detection hook
// AIDEV-NOTE: Detects network status changes and provides offline/online state

'use client'

import * as React from 'react'

interface OnlineStatus {
  /** Whether the browser is currently online */
  isOnline: boolean
  /** Whether the browser was previously offline (just came back online) */
  justCameOnline: boolean
  /** When the browser last went offline */
  lastOfflineAt: Date | null
  /** How long the browser has been offline (in ms) */
  offlineDuration: number | null
}

interface UseOnlineStatusOptions {
  /** Callback when status changes to online */
  onOnline?: () => void
  /** Callback when status changes to offline */
  onOffline?: () => void
  /** Debounce delay for status changes (ms) - prevents flickering */
  debounceMs?: number
}

interface UseOnlineStatusReturn extends OnlineStatus {
  /** Manually trigger a reconnection check */
  checkStatus: () => boolean
}

/**
 * Hook to track online/offline status
 * Uses navigator.onLine and listens to online/offline events
 *
 * @example
 * ```tsx
 * const { isOnline, justCameOnline } = useOnlineStatus({
 *   onOnline: () => toast.success('Conexao restaurada'),
 *   onOffline: () => toast.error('Voce esta offline'),
 * })
 * ```
 */
export function useOnlineStatus(
  options: UseOnlineStatusOptions = {}
): UseOnlineStatusReturn {
  const { onOnline, onOffline, debounceMs = 1000 } = options

  const [status, setStatus] = React.useState<OnlineStatus>({
    isOnline:
      typeof navigator !== 'undefined' ? navigator.onLine ?? true : true,
    justCameOnline: false,
    lastOfflineAt: null,
    offlineDuration: null,
  })

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastOnlineTimeRef = React.useRef<number>(Date.now())
  const offlineStartTimeRef = React.useRef<number | null>(null)

  // Clear pending timeout
  const clearPendingTimeout = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Handle status change with debounce
  const handleStatusChange = React.useCallback(
    (newIsOnline: boolean) => {
      clearPendingTimeout()

      timeoutRef.current = setTimeout(() => {
        const now = Date.now()

        setStatus((prev) => {
          // No change
          if (prev.isOnline === newIsOnline) {
            return prev
          }

          // Going offline
          if (!newIsOnline) {
            offlineStartTimeRef.current = now
            onOffline?.()
            return {
              isOnline: false,
              justCameOnline: false,
              lastOfflineAt: new Date(),
              offlineDuration: null,
            }
          }

          // Coming back online
          const offlineDuration = offlineStartTimeRef.current
            ? now - offlineStartTimeRef.current
            : null
          offlineStartTimeRef.current = null
          lastOnlineTimeRef.current = now

          onOnline?.()
          return {
            isOnline: true,
            justCameOnline: true,
            lastOfflineAt: prev.lastOfflineAt,
            offlineDuration,
          }
        })
      }, debounceMs)
    },
    [debounceMs, onOnline, onOffline, clearPendingTimeout]
  )

  // Handle online event
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => handleStatusChange(true)
    const handleOffline = () => handleStatusChange(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    handleStatusChange(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearPendingTimeout()
    }
  }, [handleStatusChange, clearPendingTimeout])

  // Reset justCameOnline after a delay
  React.useEffect(() => {
    if (status.justCameOnline) {
      const timer = setTimeout(() => {
        setStatus((prev) => ({
          ...prev,
          justCameOnline: false,
        }))
      }, 3000) // Reset after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [status.justCameOnline])

  // Manually check status
  const checkStatus = React.useCallback((): boolean => {
    const isCurrentlyOnline =
      typeof navigator !== 'undefined' ? navigator.onLine ?? true : true

    if (isCurrentlyOnline !== status.isOnline) {
      handleStatusChange(isCurrentlyOnline)
    }

    return isCurrentlyOnline
  }, [status.isOnline, handleStatusChange])

  return {
    ...status,
    checkStatus,
  }
}

/**
 * Format offline duration for display
 */
export function formatOfflineDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Hook to disable interactions when offline
 */
export function useOfflineDisabled(): boolean {
  const { isOnline } = useOnlineStatus()
  return !isOnline
}

'use client'

// AIDEV-NOTE: Offline indicator component
// Shows network status and provides reconnection feedback

import * as React from 'react'
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface OfflineIndicatorProps {
  /** Position of the indicator */
  position?: 'top' | 'bottom'
  /** Whether to show as a full-width banner */
  fullWidth?: boolean
  /** Whether to auto-hide when online */
  autoHide?: boolean
  /** Delay before auto-hiding (ms) */
  autoHideDelay?: number
  /** Custom message when offline */
  offlineMessage?: string
  /** Custom message when back online */
  onlineMessage?: string
  /** Whether to show dismiss button */
  dismissible?: boolean
  /** CSS class name */
  className?: string
}

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  lastOfflineAt: Date | null
}

/**
 * Hook to track network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = React.useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOfflineAt: null,
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setStatus((prev) => ({
        isOnline: true,
        wasOffline: !prev.isOnline ? true : prev.wasOffline,
        lastOfflineAt: prev.lastOfflineAt,
      }))
    }

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        wasOffline: true,
        lastOfflineAt: new Date(),
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return status
}

/**
 * Offline indicator component
 * Shows when the user is offline and provides feedback when back online
 */
export function OfflineIndicator({
  position = 'bottom',
  fullWidth = true,
  autoHide = true,
  autoHideDelay = 3000,
  offlineMessage = 'Voce esta sem conexao com a internet',
  onlineMessage = 'Conexao restaurada',
  dismissible = true,
  className,
}: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useNetworkStatus()
  const [dismissed, setDismissed] = React.useState(false)
  const [showOnlineMessage, setShowOnlineMessage] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Reset dismissed state when going offline
  React.useEffect(() => {
    if (!isOnline) {
      setDismissed(false)
    }
  }, [isOnline])

  // Show online message temporarily when reconnected
  React.useEffect(() => {
    if (isOnline && wasOffline) {
      setShowOnlineMessage(true)

      if (autoHide) {
        const timer = setTimeout(() => {
          setShowOnlineMessage(false)
        }, autoHideDelay)

        return () => clearTimeout(timer)
      }
    }
  }, [isOnline, wasOffline, autoHide, autoHideDelay])

  // Handle refresh click
  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  // Determine what to show
  const showOffline = !isOnline && !dismissed
  const showOnline = isOnline && showOnlineMessage && !dismissed

  if (!showOffline && !showOnline) {
    return null
  }

  const isOffline = !isOnline

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed z-50 transition-all duration-300 ease-in-out',
        position === 'top' && 'top-0 inset-x-0',
        position === 'bottom' && 'bottom-0 inset-x-0',
        fullWidth ? 'w-full' : 'left-1/2 -translate-x-1/2',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium transition-all',
          isOffline
            ? 'bg-amber-500 text-amber-950'
            : 'bg-green-500 text-green-950',
          !fullWidth && 'rounded-lg shadow-lg m-4'
        )}
      >
        {/* Icon */}
        <div className="shrink-0">
          {isOffline ? (
            <WifiOff className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
        </div>

        {/* Message */}
        <span>{isOffline ? offlineMessage : onlineMessage}</span>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {isOffline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'h-7 px-2 text-amber-950 hover:bg-amber-600/20',
                isRefreshing && 'cursor-not-allowed'
              )}
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5 mr-1', isRefreshing && 'animate-spin')}
              />
              {isRefreshing ? 'Atualizando...' : 'Tentar novamente'}
            </Button>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className={cn(
                'p-1 rounded-sm hover:bg-black/10 transition-colors',
                isOffline ? 'text-amber-950' : 'text-green-950'
              )}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact offline badge for inline use
 */
export function OfflineBadge({ className }: { className?: string }) {
  const { isOnline } = useNetworkStatus()

  if (isOnline) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        'bg-amber-100 text-amber-800',
        className
      )}
    >
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
    </div>
  )
}

/**
 * Hook to check if specific features should be disabled when offline
 */
export function useOfflineDisabled(): boolean {
  const { isOnline } = useNetworkStatus()
  return !isOnline
}

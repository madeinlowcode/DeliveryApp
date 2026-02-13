"use client"

// TASK-050: Real-time orders hook with Supabase Realtime
// AIDEV-NOTE: Subscribes to order changes and updates local state

import { useEffect, useCallback, useRef } from "react"
import { ordersService } from "@/services/orders.service"
import { useSound } from "@/hooks/use-sound"
import type { Order } from "@/types/database"

interface UseRealtimeOrdersOptions {
  tenantId: string
  enabled?: boolean
  onNewOrder?: (order: Order) => void
  onOrderUpdate?: (order: Order) => void
  onOrderDelete?: (order: Order) => void
  playSound?: boolean
}

interface UseRealtimeOrdersReturn {
  isConnected: boolean
  lastEvent: {
    type: "insert" | "update" | "delete"
    order: Order
    timestamp: Date
  } | null
}

// AIDEV-NOTE: Real-time subscription hook for Kanban board live updates
export function useRealtimeOrders({
  tenantId,
  enabled = true,
  onNewOrder,
  onOrderUpdate,
  onOrderDelete,
  playSound = true,
}: UseRealtimeOrdersOptions): UseRealtimeOrdersReturn {
  const { play: playNotification } = useSound("/sounds/notification.mp3")
  const isConnectedRef = useRef(false)
  const lastEventRef = useRef<UseRealtimeOrdersReturn["lastEvent"]>(null)

  // AIDEV-NOTE: Memoize callbacks to prevent unnecessary re-subscriptions
  const handleInsert = useCallback(
    (order: Order) => {
      lastEventRef.current = {
        type: "insert",
        order,
        timestamp: new Date(),
      }

      // Play notification sound for new orders
      if (playSound) {
        playNotification()
      }

      onNewOrder?.(order)
    },
    [onNewOrder, playSound, playNotification]
  )

  const handleUpdate = useCallback(
    (order: Order) => {
      lastEventRef.current = {
        type: "update",
        order,
        timestamp: new Date(),
      }
      onOrderUpdate?.(order)
    },
    [onOrderUpdate]
  )

  const handleDelete = useCallback(
    (order: Order) => {
      lastEventRef.current = {
        type: "delete",
        order,
        timestamp: new Date(),
      }
      onOrderDelete?.(order)
    },
    [onOrderDelete]
  )

  // AIDEV-NOTE: Set up Supabase Realtime subscription
  useEffect(() => {
    if (!enabled || !tenantId) {
      isConnectedRef.current = false
      return
    }

    const unsubscribe = ordersService.subscribeToOrders(tenantId, {
      onInsert: handleInsert,
      onUpdate: handleUpdate,
      onDelete: handleDelete,
    })

    isConnectedRef.current = true

    return () => {
      unsubscribe()
      isConnectedRef.current = false
    }
  }, [tenantId, enabled, handleInsert, handleUpdate, handleDelete])

  return {
    isConnected: isConnectedRef.current,
    lastEvent: lastEventRef.current,
  }
}

// AIDEV-NOTE: Combined hook that integrates useOrders with real-time updates
export function useOrdersWithRealtime(tenantId: string) {
  // This hook is a convenience wrapper that combines useOrders and useRealtimeOrders
  // Import and use both hooks in your component for full functionality

  return {
    tenantId,
    message: "Use useOrders and useRealtimeOrders together in your component",
  }
}

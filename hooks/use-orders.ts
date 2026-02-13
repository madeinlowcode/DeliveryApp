'use client'

// TASK-049: Orders hook with SWR for data fetching and caching
// AIDEV-NOTE: Custom hook for managing orders state with optimistic updates

import { useState, useCallback, useEffect, useRef } from 'react'
import { ordersService } from '@/services/orders.service'
import type { Order, OrderStatus } from '@/types/database'
import type { KanbanOrderCard, OrderWithItems } from '@/types/order'
import { formatOrderForCard } from '@/types/order'

interface UseOrdersOptions {
  tenantId: string
  autoFetch?: boolean
}

interface UseOrdersReturn {
  orders: KanbanOrderCard[]
  ordersByStatus: Record<OrderStatus, KanbanOrderCard[]>
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>
  getOrderDetails: (orderId: string) => Promise<OrderWithItems | null>
  addOrder: (order: Order, itemCount: number) => void
  removeOrder: (orderId: string) => void
}

// AIDEV-NOTE: Main hook for orders management in Kanban board
export function useOrders({ tenantId, autoFetch = true }: UseOrdersOptions): UseOrdersReturn {
  const [orders, setOrders] = useState<KanbanOrderCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchInProgress = useRef(false)

  // AIDEV-NOTE: Fetch orders from service (T-014: Added flag to prevent duplicate fetches)
  const fetchOrders = useCallback(async () => {
    if (!tenantId || fetchInProgress.current) return

    fetchInProgress.current = true
    try {
      setIsLoading(true)
      setError(null)
      const data = await ordersService.getKanbanCards(tenantId)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'))
      console.error('Error in useOrders:', err)
    } finally {
      setIsLoading(false)
      fetchInProgress.current = false
    }
  }, [tenantId])

  // AIDEV-NOTE: Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && tenantId) {
      fetchOrders()
    }
  }, [autoFetch, tenantId, fetchOrders])

  // AIDEV-NOTE: Group orders by status for Kanban columns
  const ordersByStatus: Record<OrderStatus, KanbanOrderCard[]> = {
    pending: [],
    confirmed: [],
    preparing: [],
    ready: [],
    out_for_delivery: [],
    delivered: [],
    cancelled: [],
  }

  orders.forEach((order) => {
    if (ordersByStatus[order.status]) {
      ordersByStatus[order.status].push(order)
    }
  })

  // AIDEV-NOTE: Update order status with optimistic update
  const updateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      // Optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      )

      try {
        await ordersService.updateOrderStatus(orderId, newStatus)
      } catch (err) {
        // Revert on error
        await fetchOrders()
        throw err
      }
    },
    [fetchOrders]
  )

  // AIDEV-NOTE: Get detailed order information
  const getOrderDetails = useCallback(async (orderId: string): Promise<OrderWithItems | null> => {
    return ordersService.getOrderWithItems(orderId)
  }, [])

  // AIDEV-NOTE: Add order to local state (used by realtime hook)
  const addOrder = useCallback((order: Order, itemCount: number) => {
    const card = formatOrderForCard(order, itemCount)
    setOrders((prev) => {
      // Avoid duplicates
      if (prev.some((o) => o.id === order.id)) {
        return prev
      }
      return [card, ...prev]
    })
  }, [])

  // AIDEV-NOTE: Remove order from local state
  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }, [])

  return {
    orders,
    ordersByStatus,
    isLoading,
    error,
    refetch: fetchOrders,
    updateStatus,
    getOrderDetails,
    addOrder,
    removeOrder,
  }
}

// AIDEV-NOTE: Hook for single order details
export function useOrderDetails(orderId: string | null) {
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await ordersService.getOrderWithItems(orderId)
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'))
      console.error('Error in useOrderDetails:', err)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  }
}

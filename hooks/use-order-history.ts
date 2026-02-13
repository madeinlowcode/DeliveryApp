"use client"

// TASK-033: Order history hook for fetching recent orders
// AIDEV-NOTE: Fetches and caches last 5 orders for a customer

import { useState, useCallback, useEffect } from "react"
import { Order, OrderStatus } from "@/types/database"
import { ordersService } from "@/services/orders.service"

export interface OrderHistoryItem {
  id: string
  orderNumber: string
  total: number
  status: OrderStatus
  createdAt: Date
  itemCount: number
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    notes?: string
  }>
}

interface UseOrderHistoryOptions {
  customerPhone?: string
  tenantId?: string
  limit?: number
  enabled?: boolean
}

interface UseOrderHistoryReturn {
  orders: OrderHistoryItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  getOrderById: (orderId: string) => OrderHistoryItem | undefined
}

// AIDEV-NOTE: Format order for display
function formatOrderForHistory(order: Order & { items?: any[] }): OrderHistoryItem {
  return {
    id: order.id,
    orderNumber: order.order_number,
    total: order.total,
    status: order.status,
    createdAt: new Date(order.created_at),
    itemCount: order.items?.length ?? 0,
    items: (order.items ?? []).map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      notes: item.notes ?? undefined,
    })),
  }
}

export function useOrderHistory({
  customerPhone,
  tenantId,
  limit = 5,
  enabled = true,
}: UseOrderHistoryOptions): UseOrderHistoryReturn {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!enabled || !customerPhone || !tenantId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await ordersService.getOrdersByCustomer(
        customerPhone,
        tenantId,
        limit
      )

      setOrders(data.map(formatOrderForHistory))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch order history"))
      console.error("Error in useOrderHistory:", err)
    } finally {
      setIsLoading(false)
    }
  }, [customerPhone, tenantId, limit, enabled])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const getOrderById = useCallback(
    (orderId: string): OrderHistoryItem | undefined => {
      return orders.find((o) => o.id === orderId)
    },
    [orders]
  )

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    getOrderById,
  }
}

// AIDEV-NOTE: Hook for reordering items from a previous order
export function useReorder() {
  const [isReordering, setIsReordering] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const reorder = useCallback(async (
    orderId: string,
    onAddItem?: (item: { productName: string; quantity: number }) => void
  ) => {
    setIsReordering(true)
    setError(null)

    try {
      const order = await ordersService.getOrderWithItems(orderId)

      if (!order) {
        throw new Error("Pedido nao encontrado")
      }

      // Add each item to cart via callback
      if (onAddItem && order.items) {
        for (const item of order.items) {
          onAddItem({
            productName: item.product_name,
            quantity: item.quantity,
          })
        }
      }

      return order
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to reorder")
      setError(errorObj)
      throw errorObj
    } finally {
      setIsReordering(false)
    }
  }, [])

  return {
    reorder,
    isReordering,
    error,
  }
}

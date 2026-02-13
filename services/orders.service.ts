// TASK-048: Orders service for API interactions
// AIDEV-NOTE: Service layer for order CRUD operations with Supabase

import { getClient } from '@/lib/supabase/client'
import type { Order, OrderItem, OrderStatus } from '@/types/database'
import type { OrderWithItems, KanbanOrderCard } from '@/types/order'
import { formatOrderForCard } from '@/types/order'

// AIDEV-NOTE: Orders service singleton for client-side operations
class OrdersService {
  private get supabase() {
    return getClient()
  }

  // AIDEV-NOTE: Fetch all orders for the current establishment
  async getOrders(establishmentId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', establishmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    return data ?? []
  }

  // AIDEV-NOTE: Fetch orders grouped by status for Kanban board
  async getOrdersByStatus(establishmentId: string): Promise<Record<OrderStatus, Order[]>> {
    const orders = await this.getOrders(establishmentId)

    const grouped: Record<OrderStatus, Order[]> = {
      pending: [],
      confirmed: [],
      preparing: [],
      ready: [],
      out_for_delivery: [],
      delivered: [],
      cancelled: [],
    }

    orders.forEach((order) => {
      if (grouped[order.status]) {
        grouped[order.status].push(order)
      }
    })

    return grouped
  }

  // AIDEV-NOTE: Fetch single order with items
  async getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('Error fetching order:', orderError)
      return null
    }

    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      return { ...order, items: [] }
    }

    return { ...order, items: items ?? [] }
  }

  // AIDEV-NOTE: Update order status (main Kanban operation)
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order status:', error)
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    return data
  }

  // AIDEV-NOTE: Get order item count for Kanban cards
  async getOrderItemCount(orderId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)

    if (error) {
      console.error('Error counting order items:', error)
      return 0
    }

    return count ?? 0
  }

  // AIDEV-NOTE: Fetch orders formatted for Kanban cards (T-013: Optimized with direct count)
  async getKanbanCards(establishmentId: string): Promise<KanbanOrderCard[]> {
    // AIDEV-PERF: Use single query with embedded relation count
    const { data: orders, error } = await this.supabase
      .from('orders')
      .select(
        `
        *,
        order_items(id)
      `
      )
      .eq('tenant_id', establishmentId)
      .neq('status', 'delivered')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching Kanban cards:', error)
      throw new Error(`Failed to fetch Kanban cards: ${error.message}`)
    }

    // AIDEV-PERF: Direct mapping without intermediate array allocation
    return (orders ?? []).map((order) =>
      formatOrderForCard(
        order,
        (order as Order & { order_items: { id: string }[] }).order_items?.length ?? 0
      )
    )
  }

  // AIDEV-NOTE: Cancel an order
  // AIDEV-NOTE: T-008 FIX - Delete order_items before cancelling the order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    // AIDEV-NOTE: First delete all order_items associated with this order
    const { error: itemsDeleteError } = await this.supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    if (itemsDeleteError) {
      console.error('Error deleting order items:', itemsDeleteError)
      // AIDEV-NOTE: Log but continue - we should still try to cancel the order
    }

    const updates: Partial<Order> = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    }

    if (reason) {
      updates.notes = reason
    }

    const { data, error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error cancelling order:', error)
      throw new Error(`Failed to cancel order: ${error.message}`)
    }

    return data
  }

  // AIDEV-NOTE: Fetch orders by customer phone for order history (TASK-033, T-011: N+1 fix)
  // AIDEV-PERF: Filter by phone directly in Supabase query instead of fetching all and filtering
  async getOrdersByCustomer(
    customerPhone: string,
    establishmentId: string,
    limit: number = 5
  ): Promise<(Order & { items?: OrderItem[] })[]> {
    // Normalize phone number for comparison
    const normalizedPhone = customerPhone.replace(/\D/g, '')

    // AIDEV-NOTE: Use ilike with wildcard for partial phone match in database
    const { data, error } = await this.supabase
      .from('orders')
      .select(
        `
        *,
        order_items(*)
      `
      )
      .eq('tenant_id', establishmentId)
      .like('customer_phone', `%${normalizedPhone}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching customer orders:', error)
      throw new Error(`Failed to fetch customer orders: ${error.message}`)
    }

    return data ?? []
  }

  // AIDEV-NOTE: Subscribe to real-time order changes (used by use-realtime-orders hook)
  subscribeToOrders(
    establishmentId: string,
    callbacks: {
      onInsert?: (order: Order) => void
      onUpdate?: (order: Order) => void
      onDelete?: (order: Order) => void
    }
  ) {
    const channel = this.supabase
      .channel(`orders:${establishmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${establishmentId}`,
        },
        (payload) => {
          callbacks.onInsert?.(payload.new as Order)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${establishmentId}`,
        },
        (payload) => {
          callbacks.onUpdate?.(payload.new as Order)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${establishmentId}`,
        },
        (payload) => {
          callbacks.onDelete?.(payload.old as Order)
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }
}

// AIDEV-NOTE: Export singleton instance
export const ordersService = new OrdersService()

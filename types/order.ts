// TASK-047: Order types for Kanban board
// AIDEV-NOTE: These types extend database types with UI-specific properties

import type { Order, OrderItem, OrderStatus } from "./database"

// Re-export OrderStatus for convenience
export type { OrderStatus } from "./database"

// AIDEV-NOTE: Kanban column configuration
export interface KanbanColumn {
  id: OrderStatus
  title: string
  color: string
  description?: string
}

// AIDEV-NOTE: Default Kanban columns configuration for the delivery flow
export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "pending",
    title: "Pendentes",
    color: "bg-yellow-500",
    description: "Aguardando confirmacao",
  },
  {
    id: "confirmed",
    title: "Confirmados",
    color: "bg-blue-500",
    description: "Pedido confirmado",
  },
  {
    id: "preparing",
    title: "Preparando",
    color: "bg-orange-500",
    description: "Em preparacao",
  },
  {
    id: "ready",
    title: "Prontos",
    color: "bg-green-500",
    description: "Pronto para entrega",
  },
  {
    id: "out_for_delivery",
    title: "Em Entrega",
    color: "bg-purple-500",
    description: "Saiu para entrega",
  },
  {
    id: "delivered",
    title: "Entregues",
    color: "bg-emerald-600",
    description: "Pedido finalizado",
  },
] as const

// AIDEV-NOTE: Order with items for detailed view
export interface OrderWithItems extends Order {
  items: OrderItem[]
}

// AIDEV-NOTE: Simplified order for Kanban card display
export interface KanbanOrderCard {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string | null
  total: number
  status: OrderStatus
  itemCount: number
  createdAt: Date
  notes: string | null
}

// AIDEV-NOTE: Type guard for valid order status
export function isValidOrderStatus(status: string): status is OrderStatus {
  return [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ].includes(status)
}

// AIDEV-NOTE: Get next status in the workflow
export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const flow: Record<OrderStatus, OrderStatus | null> = {
    pending: "confirmed",
    confirmed: "preparing",
    preparing: "ready",
    ready: "out_for_delivery",
    out_for_delivery: "delivered",
    delivered: null,
    cancelled: null,
  }
  return flow[currentStatus]
}

// AIDEV-NOTE: Check if status transition is valid
export function canTransitionTo(from: OrderStatus, to: OrderStatus): boolean {
  // Allow any backwards transition for corrections
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "pending", "cancelled"],
    preparing: ["ready", "confirmed", "cancelled"],
    ready: ["out_for_delivery", "preparing", "cancelled"],
    out_for_delivery: ["delivered", "ready", "cancelled"],
    delivered: [],
    cancelled: ["pending"],
  }
  return validTransitions[from]?.includes(to) ?? false
}

// AIDEV-NOTE: Format order for Kanban card display
export function formatOrderForCard(order: Order, itemCount: number): KanbanOrderCard {
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    total: order.total,
    status: order.status,
    itemCount,
    createdAt: new Date(order.created_at),
    notes: order.notes,
  }
}

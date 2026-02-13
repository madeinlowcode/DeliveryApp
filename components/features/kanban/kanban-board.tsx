"use client"

// TASK-051: Kanban board with DndContext
// AIDEV-NOTE: Main Kanban board component with drag-and-drop context

import * as React from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { useOrders } from "@/hooks/use-orders"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { useNotificationSound } from "@/hooks/use-sound"
import type { KanbanOrderCard, OrderStatus } from "@/types/order"
import { KANBAN_COLUMNS, canTransitionTo } from "@/types/order"
import type { Order } from "@/types/database"

interface KanbanBoardProps {
  tenantId: string
  onOrderClick?: (orderId: string) => void
  className?: string
}

export function KanbanBoard({
  tenantId,
  onOrderClick,
  className,
}: KanbanBoardProps) {
  // AIDEV-NOTE: Orders state management hook
  const {
    ordersByStatus,
    isLoading,
    error,
    updateStatus,
    addOrder,
    refetch,
  } = useOrders({ tenantId })

  // AIDEV-NOTE: Sound hook for new order notifications
  const { play: playNotification } = useNotificationSound()

  // AIDEV-NOTE: Active dragging state for overlay
  const [activeOrder, setActiveOrder] = React.useState<KanbanOrderCard | null>(null)

  // AIDEV-NOTE: Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  )

  // AIDEV-NOTE: Handle realtime updates for new orders
  const handleNewOrder = React.useCallback(
    (order: Order) => {
      playNotification()
      // AIDEV-NOTE: Refetch to get order with item count
      refetch()
    },
    [playNotification, refetch]
  )

  const handleOrderUpdate = React.useCallback(
    (order: Order) => {
      refetch()
    },
    [refetch]
  )

  // AIDEV-NOTE: Subscribe to realtime order changes
  useRealtimeOrders({
    tenantId,
    enabled: true,
    onNewOrder: handleNewOrder,
    onOrderUpdate: handleOrderUpdate,
    playSound: false, // We handle sound manually above
  })

  // AIDEV-NOTE: Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const orderId = active.id as string

    // Find the order being dragged
    for (const status of Object.keys(ordersByStatus) as OrderStatus[]) {
      const order = ordersByStatus[status].find((o) => o.id === orderId)
      if (order) {
        setActiveOrder(order)
        break
      }
    }
  }

  // AIDEV-NOTE: Handle drag end - update order status
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveOrder(null)

    if (!over) return

    const orderId = active.id as string
    const newStatus = over.id as OrderStatus

    // Find current status
    let currentStatus: OrderStatus | null = null
    for (const status of Object.keys(ordersByStatus) as OrderStatus[]) {
      if (ordersByStatus[status].some((o) => o.id === orderId)) {
        currentStatus = status
        break
      }
    }

    if (!currentStatus || currentStatus === newStatus) return

    // AIDEV-NOTE: Validate transition
    if (!canTransitionTo(currentStatus, newStatus)) {
      console.warn(`Invalid transition from ${currentStatus} to ${newStatus}`)
      return
    }

    try {
      await updateStatus(orderId, newStatus)
    } catch (err) {
      console.error("Failed to update order status:", err)
    }
  }

  // AIDEV-NOTE: Handle drag cancel
  const handleDragCancel = () => {
    setActiveOrder(null)
  }

  // AIDEV-NOTE: Loading state
  if (isLoading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="text-muted-foreground text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          <p>Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  // AIDEV-NOTE: Error state
  if (error) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="text-center">
          <p className="text-destructive mb-2">Erro ao carregar pedidos</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="text-primary mt-4 text-sm underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // AIDEV-NOTE: Filter columns to show only active workflow stages
  const visibleColumns = KANBAN_COLUMNS.filter(
    (col) => col.id !== "delivered" && col.id !== "cancelled"
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className={cn(
          "flex h-full gap-4 overflow-x-auto p-4",
          className
        )}
      >
        {visibleColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            orders={ordersByStatus[column.id] ?? []}
            onOrderClick={onOrderClick}
          />
        ))}
      </div>

      {/* AIDEV-NOTE: Drag overlay for visual feedback */}
      <DragOverlay dropAnimation={null}>
        {activeOrder ? (
          <KanbanCard
            order={activeOrder}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

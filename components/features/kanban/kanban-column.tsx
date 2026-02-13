"use client"

// TASK-052: Kanban column with useDroppable
// AIDEV-NOTE: Droppable column for order status grouping

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { cn } from "@/lib/utils"
import { KanbanCard } from "./kanban-card"
import type { KanbanOrderCard, OrderStatus } from "@/types/order"

interface KanbanColumnProps {
  id: OrderStatus
  title: string
  color: string
  orders: KanbanOrderCard[]
  onOrderClick?: (orderId: string) => void
}

export function KanbanColumn({
  id,
  title,
  color,
  orders,
  onOrderClick,
}: KanbanColumnProps) {
  // AIDEV-NOTE: Set up droppable area for this column
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[300px] min-w-[300px] flex-col rounded-lg border bg-muted/30",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* AIDEV-NOTE: Column header with status indicator */}
      <div className="flex items-center gap-2 border-b p-3">
        <div className={cn("size-3 rounded-full", color)} />
        <h3 className="font-semibold">{title}</h3>
        <span className="text-muted-foreground ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {orders.length}
        </span>
      </div>

      {/* AIDEV-NOTE: Column content with sortable context */}
      <SortableContext
        items={orders.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
          {orders.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground text-sm">
                Nenhum pedido
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <KanbanCard
                key={order.id}
                order={order}
                onClick={() => onOrderClick?.(order.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

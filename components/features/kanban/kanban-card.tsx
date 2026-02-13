"use client"

// TASK-053: Kanban card with useDraggable/useSortable
// AIDEV-NOTE: Draggable card component for individual orders

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Clock, GripVertical, Package, Phone, User } from "lucide-react"

import { cn } from "@/lib/utils"
import type { KanbanOrderCard } from "@/types/order"

interface KanbanCardProps {
  order: KanbanOrderCard
  isDragging?: boolean
  onClick?: () => void
}

// AIDEV-NOTE: Format relative time for order creation
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return "Agora"
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

// AIDEV-NOTE: Format currency for display
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function KanbanCard({ order, isDragging = false, onClick }: KanbanCardProps) {
  // AIDEV-NOTE: Set up sortable behavior
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: order.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCurrentlyDragging = isDragging || isSortableDragging

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all",
        "hover:border-primary/50 hover:shadow-md",
        isCurrentlyDragging && "rotate-3 scale-105 shadow-lg opacity-90",
        isCurrentlyDragging && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      {/* AIDEV-NOTE: Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-1 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity",
          "group-hover:opacity-100",
          isCurrentlyDragging && "cursor-grabbing opacity-100"
        )}
      >
        <GripVertical className="text-muted-foreground size-4" />
      </div>

      {/* AIDEV-NOTE: Card header - Order number and time */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">
            #{order.orderNumber}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Clock className="size-3" />
          {formatRelativeTime(order.createdAt)}
        </div>
      </div>

      {/* AIDEV-NOTE: Customer info */}
      <div className="mb-2 space-y-1">
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground size-3" />
          <span className="truncate text-sm">{order.customerName}</span>
        </div>
        {order.customerPhone && (
          <div className="text-muted-foreground flex items-center gap-2">
            <Phone className="size-3" />
            <span className="text-xs">{order.customerPhone}</span>
          </div>
        )}
      </div>

      {/* AIDEV-NOTE: Order details */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Package className="size-3" />
          <span>{order.itemCount} {order.itemCount === 1 ? "item" : "itens"}</span>
        </div>
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(order.total)}
        </span>
      </div>

      {/* AIDEV-NOTE: Order notes indicator */}
      {order.notes && (
        <div className="mt-2 truncate rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
          {order.notes}
        </div>
      )}
    </div>
  )
}

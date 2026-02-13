"use client"

// TASK-034: Order history list component for sidebar
// AIDEV-NOTE: Displays list of recent orders with filter options

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"
import type { OrderHistoryItem } from "@/hooks/use-order-history"
import { OrderHistoryItem as OrderItemComponent } from "./order-history-item"

interface OrderHistoryListProps {
  orders: OrderHistoryItem[]
  isLoading?: boolean
  onReorder?: (orderId: string) => void
  onViewDetails?: (orderId: string) => void
  onTrackOrder?: (orderId: string) => void
  emptyMessage?: string
  className?: string
  showDate?: boolean
}

// AIDEV-NOTE: Status filter options
type StatusFilter = "all" | "active" | "completed" | "cancelled"

// AIDEV-NOTE: Status categorization
function getStatusCategory(status: OrderStatus): "active" | "completed" | "cancelled" {
  if (status === "cancelled") return "cancelled"
  if (status === "delivered") return "completed"
  return "active"
}

// AIDEV-NOTE: Format date for display
function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Hoje"
  }

  if (diffDays === 1) {
    return "Ontem"
  }

  if (diffDays < 7) {
    return `${diffDays} dias atras`
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: date.getFullYear() !== now.getFullYear() ? "2-digit" : undefined,
  })
}

export function OrderHistoryList({
  orders,
  isLoading = false,
  onReorder,
  onViewDetails,
  onTrackOrder,
  emptyMessage = "Voce ainda nao fez nenhum pedido",
  className,
  showDate = true,
}: OrderHistoryListProps) {
  const [filter, setFilter] = React.useState<StatusFilter>("all")

  // Filter orders by status
  const filteredOrders = React.useMemo(() => {
    if (filter === "all") return orders

    return orders.filter((order) => getStatusCategory(order.status) === filter)
  }, [orders, filter])

  // Count orders by status
  const statusCounts = React.useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const category = getStatusCategory(order.status)
        acc[category]++
        return acc
      },
      { active: 0, completed: 0, cancelled: 0 }
    )
  }, [orders])

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Meus Pedidos</CardTitle>
            <CardDescription className="text-xs">
              {orders.length} pedido{orders.length !== 1 ? "s" : ""} no total
            </CardDescription>
          </div>

          {orders.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilter("all")}
              className="h-8 w-8"
              aria-label="Limpar filtros"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          )}
        </div>

        {/* Status filters */}
        {orders.length > 0 && (
          <div className="flex gap-2 mt-3">
            <FilterButton
              label="Todos"
              count={orders.length}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              label="Ativos"
              count={statusCounts.active}
              active={filter === "active"}
              onClick={() => setFilter("active")}
            />
            <FilterButton
              label="Concluidos"
              count={statusCounts.completed}
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <OrderHistoryListSkeleton />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            message={
              filter === "all"
                ? emptyMessage
                : `Nenhum pedido ${filter === "active" ? "ativo" : filter === "completed" ? "concluido" : "cancelado"}`
            }
          />
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {filteredOrders.map((order) => (
                <OrderItemComponent
                  key={order.id}
                  order={order}
                  onReorder={onReorder}
                  onViewDetails={onViewDetails}
                  onTrackOrder={onTrackOrder}
                  showDate={showDate}
                  formatDateFn={formatDate}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Filter button component
interface FilterButtonProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
      <Badge
        variant={active ? "secondary" : "outline"}
        className={cn(
          "h-5 px-1.5 text-[10px]",
          active && "bg-primary-foreground/20 text-primary-foreground"
        )}
      >
        {count}
      </Badge>
    </button>
  )
}

// AIDEV-NOTE: Empty state component
interface EmptyStateProps {
  message: string
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/50 mb-4"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>

      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// AIDEV-NOTE: Skeleton for order history list
function OrderHistoryListSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

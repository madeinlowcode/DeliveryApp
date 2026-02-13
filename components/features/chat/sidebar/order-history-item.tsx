"use client"

// TASK-035: Order history item component
// AIDEV-NOTE: Individual order card with actions (reorder, track, view details)

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"
import type { OrderHistoryItem } from "@/hooks/use-order-history"

// AIDEV-NOTE: Status configuration for display
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendente",
    variant: "outline",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  confirmed: {
    label: "Confirmado",
    variant: "secondary",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
  preparing: {
    label: "Preparando",
    variant: "default",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8" />
        <path d="m4.93 10.93 1.41 1.41" />
        <path d="M2 18h2" />
        <path d="M20 18h2" />
        <path d="m19.07 10.93-1.41 1.41" />
        <path d="M22 22H2" />
        <path d="m8 22 4-10 4 10" />
      </svg>
    ),
  },
  ready: {
    label: "Pronto",
    variant: "default",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  out_for_delivery: {
    label: "Em entrega",
    variant: "default",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  delivered: {
    label: "Entregue",
    variant: "secondary",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    ),
  },
}

interface OrderHistoryItemProps {
  order: OrderHistoryItem
  onReorder?: (orderId: string) => void
  onViewDetails?: (orderId: string) => void
  onTrackOrder?: (orderId: string) => void
  showDate?: boolean
  formatDateFn?: (date: Date) => string
  className?: string
  currency?: string
}

export function OrderHistoryItem({
  order,
  onReorder,
  onViewDetails,
  onTrackOrder,
  showDate = true,
  formatDateFn = (date) => date.toLocaleDateString("pt-BR"),
  className,
  currency = "R$",
}: OrderHistoryItemProps) {
  const statusConfig = STATUS_CONFIG[order.status]
  const canReorder = order.status === "delivered" || order.status === "cancelled"
  const canTrack = ["confirmed", "preparing", "ready", "out_for_delivery"].includes(order.status)

  return (
    <div className={cn("flex gap-3 p-4 hover:bg-muted/50 transition-colors", className)}>
      {/* Order icon/placeholder */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      {/* Order info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">#{order.orderNumber}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusConfig.variant} className="text-[10px] h-5">
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.label}
              </Badge>
              {showDate && (
                <span className="text-xs text-muted-foreground">
                  {formatDateFn(order.createdAt)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm font-semibold whitespace-nowrap">
            {currency} {order.total.toFixed(2)}
          </p>
        </div>

        {/* Items preview */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {order.itemCount} {order.itemCount === 1 ? "item" : "itens"}
          {order.items.length > 0 && ` • ${order.items[0].productName}`}
          {order.items.length > 1 && ` +${order.items.length - 1}`}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2">
          {canReorder && onReorder && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onReorder(order.id)}
              aria-label={`Pedir novamente ${order.orderNumber}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="m21.5 2v6h-6M21.34 5.5A10 10 0 1 1 11.26 2.5" />
              </svg>
              Pedir novamente
            </Button>
          )}

          {canTrack && onTrackOrder && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onTrackOrder(order.id)}
              aria-label={`Acompanhar pedido ${order.orderNumber}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Acompanhar
            </Button>
          )}

          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Mais opcoes"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(order.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Ver detalhes
                </DropdownMenuItem>
              )}

              {canReorder && onReorder && (
                <DropdownMenuItem onClick={() => onReorder(order.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="m21.5 2v6h-6M21.34 5.5A10 10 0 1 1 11.26 2.5" />
                  </svg>
                  Pedir novamente
                </DropdownMenuItem>
              )}

              {canTrack && onTrackOrder && (
                <DropdownMenuItem onClick={() => onTrackOrder(order.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  Acompanhar pedido
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

// AIDEV-NOTE: Compact variant for smaller displays
export function OrderHistoryItemCompact({
  order,
  onClick,
  currency = "R$",
}: {
  order: OrderHistoryItem
  onClick?: () => void
  currency?: string
}) {
  const statusConfig = STATUS_CONFIG[order.status]

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">#{order.orderNumber}</span>
          <span className="text-xs font-medium whitespace-nowrap">
            {currency} {order.total.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <Badge variant={statusConfig.variant} className="text-[10px] h-5 px-1.5">
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {order.createdAt.toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

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
        className="flex-shrink-0 text-muted-foreground"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  )
}

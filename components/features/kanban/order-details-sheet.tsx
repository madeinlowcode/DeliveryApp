"use client"

// TASK-054: Order details sheet/drawer
// AIDEV-NOTE: Slide-over panel showing full order details

import * as React from "react"
import {
  Clock,
  MapPin,
  Package,
  Phone,
  User,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useOrderDetails } from "@/hooks/use-orders"
import type { OrderStatus } from "@/types/order"
import { KANBAN_COLUMNS, getNextStatus, canTransitionTo } from "@/types/order"

interface OrderDetailsSheetProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => Promise<void>
}

// AIDEV-NOTE: Format currency for display
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// AIDEV-NOTE: Format date for display
function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// AIDEV-NOTE: Get status configuration
function getStatusConfig(status: OrderStatus) {
  return KANBAN_COLUMNS.find((col) => col.id === status) ?? {
    id: status,
    title: status,
    color: "bg-gray-500",
  }
}

export function OrderDetailsSheet({
  orderId,
  open,
  onOpenChange,
  onStatusChange,
}: OrderDetailsSheetProps) {
  const { order, isLoading, error } = useOrderDetails(orderId)
  const [isUpdating, setIsUpdating] = React.useState(false)

  // AIDEV-NOTE: Handle status advancement
  const handleAdvanceStatus = async () => {
    if (!order || !onStatusChange) return

    const nextStatus = getNextStatus(order.status)
    if (!nextStatus) return

    try {
      setIsUpdating(true)
      await onStatusChange(order.id, nextStatus)
    } catch (err) {
      console.error("Failed to advance status:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  // AIDEV-NOTE: Handle order cancellation
  const handleCancel = async () => {
    if (!order || !onStatusChange) return

    if (!canTransitionTo(order.status, "cancelled")) {
      return
    }

    try {
      setIsUpdating(true)
      await onStatusChange(order.id, "cancelled")
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to cancel order:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const statusConfig = order ? getStatusConfig(order.status) : null
  const nextStatus = order ? getNextStatus(order.status) : null
  const nextStatusConfig = nextStatus ? getStatusConfig(nextStatus) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="size-5" />
            {order ? `Pedido #${order.order_number}` : "Detalhes do Pedido"}
          </SheetTitle>
          <SheetDescription>
            {order
              ? `Criado em ${formatDateTime(order.created_at)}`
              : "Carregando informacoes..."}
          </SheetDescription>
        </SheetHeader>

        {/* AIDEV-NOTE: Loading state */}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* AIDEV-NOTE: Error state */}
        {error && (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <p className="text-destructive mb-2">Erro ao carregar pedido</p>
              <p className="text-muted-foreground text-sm">{error.message}</p>
            </div>
          </div>
        )}

        {/* AIDEV-NOTE: Order content */}
        {order && !isLoading && (
          <div className="flex-1 overflow-y-auto">
            {/* Status badge */}
            <div className="mb-4">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white",
                  statusConfig?.color
                )}
              >
                <div className="size-2 rounded-full bg-white/30" />
                {statusConfig?.title}
              </div>
            </div>

            {/* Customer info */}
            <div className="mb-4 rounded-lg border p-4">
              <h4 className="mb-3 font-semibold">Cliente</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span>{order.customer_name}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-primary hover:underline"
                    >
                      {order.customer_phone}
                    </a>
                  </div>
                )}
                {order.customer_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                    <span className="text-sm">{order.customer_address}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Order items */}
            <div className="mb-4">
              <h4 className="mb-3 font-semibold">Itens do Pedido</h4>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                            {item.quantity}x
                          </span>
                          <span className="font-medium">{item.product_name}</span>
                        </div>
                        {item.notes && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum item encontrado
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Order total */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="mb-2 font-semibold">Observacoes</h4>
                  <p className="rounded-lg border bg-muted/30 p-3 text-sm">
                    {order.notes}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* AIDEV-NOTE: Action footer */}
        {order && !isLoading && (
          <SheetFooter className="flex-col gap-2 sm:flex-col">
            {/* Advance status button */}
            {nextStatus && nextStatusConfig && (
              <Button
                onClick={handleAdvanceStatus}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 size-4" />
                )}
                Mover para {nextStatusConfig.title}
                <ChevronRight className="ml-auto size-4" />
              </Button>
            )}

            {/* Cancel button */}
            {canTransitionTo(order.status, "cancelled") && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="w-full"
              >
                <XCircle className="mr-2 size-4" />
                Cancelar Pedido
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

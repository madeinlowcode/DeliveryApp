"use client"

// TASK-028: Order confirmation component showing success message
// AIDEV-NOTE: Displays order number, estimated time, and success state

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface OrderConfirmationData {
  orderNumber: string
  estimatedTime?: number // in minutes
  total: number
  customerName: string
  status?: string
  createdAt?: Date
}

interface OrderConfirmationProps {
  order: OrderConfirmationData
  onNewOrder?: () => void
  onTrackOrder?: () => void
  currency?: string
  className?: string
  showEstimatedTime?: boolean
}

export function OrderConfirmation({
  order,
  onNewOrder,
  onTrackOrder,
  currency = "R$",
  className,
  showEstimatedTime = true,
}: OrderConfirmationProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="text-center">
        {/* Success icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600 dark:text-green-500"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </div>

        <CardTitle className="text-2xl">Pedido realizado!</CardTitle>
        <CardDescription>
          Seu pedido foi confirmado e esta sendo preparado
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order number */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Numero do pedido</p>
          <p className="text-3xl font-bold tracking-wider text-primary mt-1">
            #{order.orderNumber}
          </p>
        </div>

        {/* Estimated time */}
        {showEstimatedTime && order.estimatedTime && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tempo estimado</span>
              <span className="text-sm text-muted-foreground">
                {order.estimatedTime} minutos
              </span>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Comecamos a preparar seu pedido agora
            </p>
          </div>
        )}

        {/* Order details */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cliente</span>
            <span className="font-medium">{order.customerName}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total pago</span>
            <span className="font-bold text-foreground">
              {currency} {order.total.toFixed(2)}
            </span>
          </div>

          {order.createdAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horario</span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Next steps info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
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
              className="text-blue-600 dark:text-blue-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            O que acontece agora?
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Voce recebera atualizacoes sobre o status do pedido</li>
            <li>2. Quando estiver pronto, enviaremos para entrega</li>
            <li>3. O entregador entrara em contato antes de chegar</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onTrackOrder && (
            <Button
              variant="outline"
              onClick={onTrackOrder}
              className="flex-1"
              aria-label="Acompanhar pedido"
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
                className="mr-2"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Acompanhar pedido
            </Button>
          )}

          {onNewOrder && (
            <Button
              onClick={onNewOrder}
              className="flex-1"
              aria-label="Fazer novo pedido"
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
                className="mr-2"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Novo pedido
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Simplified confirmation for smaller displays
export function OrderConfirmationCompact({
  orderNumber,
  estimatedTime,
  onTrackOrder,
}: {
  orderNumber: string
  estimatedTime?: number
  onTrackOrder?: () => void
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
      <div className="flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-600 dark:text-green-500"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Pedido confirmado!</p>
        <p className="text-xs text-muted-foreground">
          #{orderNumber}
          {estimatedTime && ` • ${estimatedTime} min`}
        </p>
      </div>

      {onTrackOrder && (
        <Button size="sm" variant="outline" onClick={onTrackOrder}>
          Acompanhar
        </Button>
      )}
    </div>
  )
}

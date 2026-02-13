"use client"

// TASK-030: Order status component
// AIDEV-NOTE: Displays current status of an order with visual progress

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/database"

// AIDEV-NOTE: Status configuration with labels, icons, and progress
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string
    description: string
    progress: number
    color: string
    icon: React.ReactNode
  }
> = {
  pending: {
    label: "Pendente",
    description: "Aguardando confirmacao",
    progress: 10,
    color: "bg-yellow-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  confirmed: {
    label: "Confirmado",
    description: "Pedido confirmado pelo estabelecimento",
    progress: 25,
    color: "bg-blue-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
  preparing: {
    label: "Preparando",
    description: "Seu pedido esta sendo preparado",
    progress: 50,
    color: "bg-orange-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
    description: "Pedido pronto para entrega",
    progress: 75,
    color: "bg-purple-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  out_for_delivery: {
    label: "Saiu para entrega",
    description: "Pedido a caminho do seu endereco",
    progress: 90,
    color: "bg-indigo-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  delivered: {
    label: "Entregue",
    description: "Pedido entregue com sucesso",
    progress: 100,
    color: "bg-green-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
  cancelled: {
    label: "Cancelado",
    description: "Pedido foi cancelado",
    progress: 0,
    color: "bg-red-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    ),
  },
}

// AIDEV-NOTE: Order status flow for progress indicators
const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
]

interface OrderStatusProps {
  status: OrderStatus
  orderNumber?: string
  estimatedTime?: number
  updatedAt?: Date
  variant?: "full" | "compact" | "badge"
  className?: string
}

export function OrderStatus({
  status,
  orderNumber,
  estimatedTime,
  updatedAt,
  variant = "full",
  className,
}: OrderStatusProps) {
  const config = STATUS_CONFIG[status]
  const currentIndex = STATUS_FLOW.indexOf(status)
  const isCancelled = status === "cancelled"

  if (variant === "badge") {
    return (
      <Badge
        variant={isCancelled ? "destructive" : "secondary"}
        className={cn("", className)}
      >
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        <span className="font-medium">{config.label}</span>
        {estimatedTime && status === "preparing" && (
          <span className="text-muted-foreground">
            • ~{estimatedTime} min
          </span>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Status do pedido</CardTitle>
          {orderNumber && (
            <Badge variant="outline">#{orderNumber}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current status */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isCancelled
                ? "bg-red-100 dark:bg-red-900/20"
                : "bg-primary/10"
            )}
          >
            {config.icon}
          </div>

          <div>
            <p className="font-medium">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Progress bar */}
        {!isCancelled && (
          <div className="space-y-2">
            <Progress value={config.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pedido realizado</span>
              <span>Entregue</span>
            </div>
          </div>
        )}

        {/* Estimated time */}
        {estimatedTime && status === "preparing" && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tempo estimado:</span>
              <span className="font-medium">{estimatedTime} minutos</span>
            </div>
          </div>
        )}

        {/* Status timeline */}
        {!isCancelled && (
          <div className="space-y-2 pt-2">
            {STATUS_FLOW.slice(0, currentIndex + 1).map((s, index) => (
              <StatusStep
                key={s}
                status={s}
                isActive={s === status}
                isCompleted={index < currentIndex}
                isLast={index === currentIndex}
              />
            ))}
          </div>
        )}

        {/* Updated at */}
        {updatedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Atualizado em{" "}
            {new Date(updatedAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Individual status step in timeline
interface StatusStepProps {
  status: OrderStatus
  isActive: boolean
  isCompleted: boolean
  isLast: boolean
}

function StatusStep({ status, isActive, isCompleted, isLast }: StatusStepProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-3 h-3 rounded-full border-2",
            isActive && "border-primary",
            isCompleted && "bg-primary border-primary",
            !isActive && !isCompleted && "border-muted-foreground/30"
          )}
        />
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[24px]",
              isCompleted ? "bg-primary" : "bg-muted-foreground/20"
            )}
          />
        )}
      </div>

      <div
        className={cn(
          "text-sm pb-4",
          isActive ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {config.label}
      </div>
    </div>
  )
}

// AIDEV-NOTE: Skeleton for order status
export function OrderStatusSkeleton({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact" | "badge"
  className?: string
}) {
  if (variant === "badge") {
    return <Skeleton className={cn("h-6 w-24", className)} />
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

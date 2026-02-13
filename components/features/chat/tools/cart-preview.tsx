"use client"

// TASK-026: Cart preview component with fixed footer
// AIDEV-NOTE: Shows compact cart summary in a fixed footer/bar

import * as React from "react"
import { CartSummary as CartSummaryType } from "@/types/cart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CartPreviewProps {
  cart: CartSummaryType | null
  isLoading?: boolean
  onViewCart?: () => void
  onCheckout?: () => void
  currency?: string
  position?: "bottom" | "top"
  className?: string
}

export function CartPreview({
  cart,
  isLoading = false,
  onViewCart,
  onCheckout,
  currency = "R$",
  position = "bottom",
  className,
}: CartPreviewProps) {
  const itemCount = cart?.itemCount ?? 0
  const total = cart?.total ?? 0

  if (isLoading) {
    return <CartPreviewSkeleton position={position} className={className} />
  }

  if (itemCount === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg",
        position === "bottom" ? "bottom-0" : "top-0",
        className
      )}
    >
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Item count and total */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
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
                className="text-primary"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <Badge variant="secondary" className="font-medium">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground hidden sm:block">
              <span className="font-semibold text-foreground">
                {currency} {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onViewCart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewCart}
                className="hidden sm:flex"
                aria-label="Ver carrinho"
              >
                Ver carrinho
              </Button>
            )}

            {onCheckout && (
              <Button
                size="sm"
                onClick={onCheckout}
                className="min-w-[140px]"
                aria-label="Finalizar pedido"
              >
                Finalizar
                <span className="ml-2 text-xs opacity-80">
                  {currency} {total.toFixed(2)}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// AIDEV-NOTE: Skeleton loader for cart preview
function CartPreviewSkeleton({
  position,
  className,
}: {
  position: "bottom" | "top"
  className?: string
}) {
  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 border-t bg-background shadow-lg",
        position === "bottom" ? "bottom-0" : "top-0",
        className
      )}
    >
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}

"use client"

// TASK-024: Cart summary component displaying items and totals
// AIDEV-NOTE: Shows all cart items with individual totals and grand total

import * as React from "react"
import { CartSummary as CartSummaryType } from "@/types/cart"
import { QuantitySelector } from "./quantity-selector"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CartSummaryProps {
  cart: CartSummaryType | null
  isLoading?: boolean
  onQuantityChange?: (itemId: string, newQuantity: number) => void
  onRemoveItem?: (itemId: string) => void
  onCheckout?: () => void
  currency?: string
  className?: string
}

export function CartSummary({
  cart,
  isLoading = false,
  onQuantityChange,
  onRemoveItem,
  onCheckout,
  currency = "R$",
  className,
}: CartSummaryProps) {
  if (isLoading) {
    return <CartSummarySkeleton className={className} />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
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
          className="text-muted-foreground mb-4"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p className="text-lg font-medium text-foreground">Seu carrinho esta vazio</p>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione itens para fazer seu pedido
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Items list */}
      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            currency={currency}
            onQuantityChange={onQuantityChange}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {currency} {cart.subtotal.toFixed(2)}
          </span>
        </div>

        {cart.deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de entrega</span>
            <span className="font-medium">
              {currency} {cart.deliveryFee.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-primary">
            {currency} {cart.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Checkout button */}
      {onCheckout && (
        <Button
          onClick={onCheckout}
          className="w-full mt-6"
          size="lg"
          aria-label="Finalizar pedido"
        >
          Finalizar pedido
        </Button>
      )}
    </div>
  )
}

// AIDEV-NOTE: Individual cart item component
interface CartItemProps {
  item: {
    id: string
    name: string
    quantity: number
    unitPrice: number
    total: number
    variation?: string
    addons?: string[]
    notes?: string
  }
  currency: string
  onQuantityChange?: (itemId: string, newQuantity: number) => void
  onRemove?: (itemId: string) => void
}

function CartItem({ item, currency, onQuantityChange, onRemove }: CartItemProps) {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity)

  const handleIncrease = () => {
    const newQty = localQuantity + 1
    setLocalQuantity(newQty)
    onQuantityChange?.(item.id, newQty)
  }

  const handleDecrease = () => {
    if (localQuantity > 1) {
      const newQty = localQuantity - 1
      setLocalQuantity(newQty)
      onQuantityChange?.(item.id, newQty)
    }
  }

  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card">
      {/* Item info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{item.name}</h4>

        {item.variation && (
          <p className="text-sm text-muted-foreground">{item.variation}</p>
        )}

        {item.addons && item.addons.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            + {item.addons.join(", ")}
          </p>
        )}

        {item.notes && (
          <p className="text-xs text-muted-foreground italic mt-1">
            Obs: {item.notes}
          </p>
        )}

        <p className="text-sm font-semibold text-primary mt-2">
          {currency} {item.total.toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <QuantitySelector
          quantity={localQuantity}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          aria-label={`Quantidade de ${item.name}`}
        />

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(item.id)}
            aria-label={`Remover ${item.name} do carrinho`}
          >
            Remover
          </Button>
        )}
      </div>
    </div>
  )
}

// AIDEV-NOTE: Skeleton loader for cart summary
function CartSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg border">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </div>
          <Skeleton className="h-16 w-24" />
        </div>
      ))}
      <div className="border-t pt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  )
}

// TASK-046: Product detail modal adjusted for mobile
// AIDEV-NOTE: Full-screen on mobile, centered modal on desktop

"use client"

import * as React from "react"
import { Plus, Minus, ShoppingCart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageWithFallback } from "@/components/shared/image-with-fallback"
import type { Product, ProductVariation, ProductAddon } from "@/types/database"

interface ProductDetailModalProps {
  product: Product
  variations?: ProductVariation[]
  addons?: ProductAddon[]
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (item: {
    productId: string
    quantity: number
    variationId?: string
    addonIds?: string[]
  }) => void
}

export function ProductDetailModal({
  product,
  variations = [],
  addons = [],
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = React.useState(1)
  const [selectedVariation, setSelectedVariation] = React.useState<string>()
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(new Set())
  const isMobile = React.useMemo(() => {
    // AIDEV-NOTE: Simple mobile detection (can be enhanced with useMobile hook)
    if (typeof window === "undefined") return false
    return window.innerWidth < 768
  }, [])

  // AIDEV-NOTE: Format price to BRL
  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // AIDEV-NOTE: Calculate total price
  const totalPrice = React.useMemo(() => {
    let price = product.price

    if (selectedVariation) {
      const variation = variations.find((v) => v.id === selectedVariation)
      if (variation) {
        price += variation.price_modifier
      }
    }

    selectedAddons.forEach((addonId) => {
      const addon = addons.find((a) => a.id === addonId)
      if (addon) {
        price += addon.price
      }
    })

    return price * quantity
  }, [product.price, selectedVariation, selectedAddons, quantity, variations, addons])

  // AIDEV-NOTE: Handle add to cart
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({
        productId: product.id,
        quantity,
        variationId: selectedVariation,
        addonIds: Array.from(selectedAddons),
      })
    }
    onClose()
  }

  // AIDEV-NOTE: Toggle addon selection
  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev)
      if (next.has(addonId)) {
        next.delete(addonId)
      } else {
        next.add(addonId)
      }
      return next
    })
  }

  // AIDEV-NOTE: Use Sheet on mobile, Dialog on desktop
  const content = (
    <>
      <DialogHeader className={cn(isMobile ? "px-4 pt-4" : "")}>
        <SheetHeader>
          <DialogTitle className="text-lg">{product.name}</DialogTitle>
        </SheetHeader>
      </DialogHeader>

      <ScrollArea className={cn("flex-1", isMobile ? "h-[calc(100vh-250px)]" : "")}>
        <div className="space-y-6 p-4">
          {/* Product Image */}
          <div className={cn(
            "overflow-hidden rounded-lg bg-muted",
            isMobile ? "aspect-square w-full" : "aspect-video w-full"
          )}>
            <ImageWithFallback
              src={product.image_url}
              alt={product.name}
              fallbackType="product"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Descricao</h3>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {/* Variations */}
          {variations.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium">
                Variacao
              </h3>
              <div className="flex flex-wrap gap-2">
                {variations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      selectedVariation === variation.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-muted"
                    )}
                  >
                    {variation.name}
                    {variation.price_modifier !== 0 && (
                      <span className="ml-1">
                        {variation.price_modifier > 0 ? "+" : ""}
                        {formatPrice(variation.price_modifier)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {addons.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium">Adicionais</h3>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.has(addon.id)
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-muted"
                      )}
                    >
                      <div>
                        <span className="font-medium">{addon.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {formatPrice(addon.price)}
                        </span>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="shrink-0">
                          Adicionado
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Quantidade</h3>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer with total and add to cart */}
      <div className={cn(
        "border-t p-4",
        isMobile ? "sticky bottom-0 bg-background" : ""
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatPrice(totalPrice)}</p>
          </div>
          <Button
            size={isMobile ? "lg" : "default"}
            onClick={handleAddToCart}
            className={cn(
              "gap-2",
              isMobile && "flex-1"
            )}
          >
            <ShoppingCart className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
            {isMobile ? "Adicionar" : "Adicionar ao carrinho"}
          </Button>
        </div>
      </div>
    </>
  )

  // AIDEV-NOTE: Mobile: use Sheet (full-screen from bottom)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="flex h-[95vh] flex-col p-0"
        >
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  // AIDEV-NOTE: Desktop: use centered Dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        {content}
      </DialogContent>
    </Dialog>
  )
}

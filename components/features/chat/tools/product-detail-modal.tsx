// TASK-020: Product detail modal - Dialog for selecting variations and addons
// AIDEV-NOTE: Modal for product configuration before adding to cart

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIProductDisplay } from "@/lib/ai/ai-menu.service"
import { VariationSelector } from "./variation-selector"
import { AddonSelector } from "./addon-selector"

interface ProductDetailModalProps {
  product: AIProductDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (productId: string, variationId: string | null, addons: string[]) => void
  isLoading?: boolean
}

// AIDEV-NOTE: Selected state for variations and addons
interface SelectedState {
  variationId: string | null
  addonIds: string[]
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
  isLoading = false,
}: ProductDetailModalProps) {
  const [selected, setSelected] = useState<SelectedState>({
    variationId: null,
    addonIds: [],
  })

  // Reset selection when product changes
  if (product && open) {
    const needsVariation = product.variations && product.variations.length > 0
    if (needsVariation && !selected.variationId) {
      // Auto-select first variation
      setSelected({
        ...selected,
        variationId: product.variations[0].id,
      })
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const needsVariation = product.variations && product.variations.length > 0
    if (needsVariation && !selected.variationId) {
      return // Should not happen due to auto-select
    }

    onAddToCart(product.id, selected.variationId, selected.addonIds)

    // Reset selection after adding
    setSelected({ variationId: null, addonIds: [] })
    onOpenChange(false)
  }

  const handleClose = () => {
    setSelected({ variationId: null, addonIds: [] })
    onOpenChange(false)
  }

  // Calculate total price
  const calculateTotal = () => {
    if (!product) return 0

    let total = product.price

    // Add variation modifier
    if (selected.variationId) {
      const variation = product.variations.find((v) => v.id === selected.variationId)
      if (variation) {
        total += variation.priceModifier
      }
    }

    // Add addons
    if (selected.addonIds.length > 0 && product.addons) {
      selected.addonIds.forEach((addonId) => {
        const addon = product.addons.find((a) => a.id === addonId)
        if (addon) {
          total += addon.price
        }
      })
    }

    return total
  }

  if (!product) return null

  const hasVariations = product.variations && product.variations.length > 0
  const hasAddons = product.addons && product.addons.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-slot="product-detail-modal"
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          {product.categoryName && (
            <DialogDescription>
              <Badge variant="secondary" className="mt-2">
                {product.categoryName}
              </Badge>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Product image if available */}
        {product.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        {/* Variations selector */}
        {hasVariations && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Tamanho / Variação</h4>
            <VariationSelector
              variations={product.variations}
              basePrice={product.price}
              selectedId={selected.variationId}
              onSelect={(variationId) =>
                setSelected({ ...selected, variationId })
              }
            />
          </div>
        )}

        {/* Addons selector */}
        {hasAddons && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Adicionais</h4>
            <AddonSelector
              addons={product.addons}
              selectedIds={selected.addonIds}
              onSelect={(addonIds) =>
                setSelected({ ...selected, addonIds })
              }
            />
          </div>
        )}

        {/* Footer with total and add button */}
        <DialogFooter className="flex-col sm:flex-col gap-3">
          {/* Price summary */}
          <div className="flex items-center justify-between w-full py-3 border-t">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">
              {formatPrice(calculateTotal())}
            </span>
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={isLoading || (hasVariations && !selected.variationId)}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              "Adicionar ao carrinho"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AIDEV-NOTE: Format price helper
function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export default ProductDetailModal

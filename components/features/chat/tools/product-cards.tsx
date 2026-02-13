// TASK-019: Product cards component - grid of products with images
// AIDEV-NOTE: Displays products in cards with name, description, price, and add button

"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIProductDisplay } from "@/lib/ai/ai-menu.service"
import { Badge } from "@/components/ui/badge"

interface ProductCardsProps {
  products: AIProductDisplay[]
  className?: string
  onProductClick?: (product: AIProductDisplay) => void
  onAddToCart?: (product: AIProductDisplay) => void
}

export function ProductCards({
  products,
  className,
  onProductClick,
  onAddToCart,
}: ProductCardsProps) {
  if (products.length === 0) {
    return (
      <div
        data-slot="product-cards-empty"
        className={cn("text-center py-8 text-muted-foreground", className)}
      >
        <p>Nenhum produto disponível nesta categoria.</p>
      </div>
    )
  }

  return (
    <div
      data-slot="product-cards"
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

// AIDEV-NOTE: Individual product card
interface ProductCardProps {
  product: AIProductDisplay
  onClick?: (product: AIProductDisplay) => void
  onAddToCart?: (product: AIProductDisplay) => void
}

function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  const hasVariations = product.variations && product.variations.length > 0
  const hasAddons = product.addons && product.addons.length > 0
  const needsModal = hasVariations || hasAddons

  const handleCardClick = () => {
    onClick?.(product)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking add button
    onAddToCart?.(product)
  }

  // Calculate price range for display
  const getBasePrice = () => {
    if (!hasVariations) return product.priceFormatted

    const modifiers = product.variations.map((v) => v.priceModifier)
    const minPrice = product.price + Math.min(...modifiers)
    const maxPrice = product.price + Math.max(...modifiers)

    if (minPrice === maxPrice) {
      return formatPrice(minPrice)
    }
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
  }

  return (
    <Card
      data-slot="product-card"
      data-product-id={product.id}
      className={cn(
        "group overflow-hidden transition-all duration-200",
        "hover:shadow-md",
        needsModal && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={needsModal ? handleCardClick : undefined}
      onKeyDown={(e) => {
        if (needsModal && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          handleCardClick()
        }
      }}
      tabIndex={needsModal ? 0 : undefined}
      role={needsModal ? "button" : undefined}
      aria-label={`Ver detalhes de ${product.name}`}
    >
      {/* Product image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}

        {/* Category badge */}
        {product.categoryName && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-xs"
          >
            {product.categoryName}
          </Badge>
        )}

        {/* Variations/Addons indicator */}
        {(hasVariations || hasAddons) && (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 text-xs bg-background/80 backdrop-blur-sm"
          >
            {hasVariations && hasAddons
              ? "Opções disponíveis"
              : hasVariations
                ? "Tamanhos"
                : "Adicionais"}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Product name */}
        <h3 className="font-semibold text-base leading-tight mb-1">
          {product.name}
        </h3>

        {/* Product description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        {/* Variations preview */}
        {hasVariations && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.variations.slice(0, 3).map((variation) => (
              <span
                key={variation.id}
                className="text-xs bg-muted px-2 py-0.5 rounded-full"
              >
                {variation.name}
              </span>
            ))}
            {product.variations.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{product.variations.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Price */}
        <div className="flex flex-col">
          <span className="text-lg font-bold">{getBasePrice()}</span>
          {hasVariations && (
            <span className="text-xs text-muted-foreground">a partir de</span>
          )}
        </div>

        {/* Add button */}
        <Button
          size="sm"
          className={cn(
            "gap-1.5",
            !needsModal && "bg-primary hover:bg-primary/90"
          )}
          onClick={handleAddClick}
          aria-label={needsModal ? "Ver opções" : `Adicionar ${product.name}`}
        >
          <Plus className="size-4" />
          {needsModal ? "Opções" : "Adicionar"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// AIDEV-NOTE: Format price helper
function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

// AIDEV-NOTE: Export memoized component
export default ProductCards

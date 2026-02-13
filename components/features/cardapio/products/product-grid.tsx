// TASK-045: Responsive product cards grid
// AIDEV-NOTE: 1 column on mobile, 2 on desktop

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { Product, Category } from "@/types/database"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  products: Product[]
  categories?: Map<string, Category>
  isLoading?: boolean
  onDelete?: (id: string) => Promise<void>
  onToggleAvailability?: (id: string, isAvailable: boolean) => Promise<void>
  className?: string
}

// AIDEV-NOTE: Responsive grid: 1 column mobile (<768px), 2 desktop (>=768px)
export function ProductGrid({
  products,
  categories,
  isLoading: _isLoading,
  onDelete,
  onToggleAvailability,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        // AIDEV-NOTE: Mobile-first responsive grid
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          category={product.category_id ? categories?.get(product.category_id) : undefined}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
        />
      ))}
    </div>
  )
}

// AIDEV-NOTE: Compact product cards for chat interface
interface ProductCardGridProps {
  products: Product[]
  onSelectProduct?: (product: Product) => void
  className?: string
}

export function ProductCardGrid({
  products,
  onSelectProduct,
  className,
}: ProductCardGridProps) {
  // AIDEV-NOTE: Format price to BRL
  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <div
      className={cn(
        // AIDEV-NOTE: Chat interface: 1 column mobile, 2 tablet, 3 desktop
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelectProduct?.(product)}
          className="group flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-md disabled:opacity-50"
          disabled={!product.is_available}
        >
          {/* Product Image */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {product.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element -- Native img for dynamic external sources */
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-2xl">🍔</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="truncate font-medium group-hover:text-primary">
                {product.name}
              </h4>
              <span className="shrink-0 font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {product.description}
              </p>
            )}

            {!product.is_available && (
              <span className="mt-1 inline-block text-xs text-muted-foreground">
                Indisponivel
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

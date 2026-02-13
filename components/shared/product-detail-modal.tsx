// TASK-056: Product detail modal with focus trap
// AIDEV-NOTE: WCAG 2.1 AA compliance - focus trap for modal accessibility

'use client'

import * as React from 'react'
import {
  X,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Product, ProductVariation, ProductAddon } from '@/types/database'

interface ProductDetailModalProps {
  product: Product
  variations?: ProductVariation[]
  addons?: ProductAddon[]
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (variation?: string, addons?: string[]) => void
}

/**
 * ProductDetailModal component
 * Displays detailed product information in a modal with focus trap
 * Meets WCAG 2.1 AA focus management requirements
 */
export function ProductDetailModal({
  product,
  variations = [],
  addons = [],
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  // AIDEV-NOTE: Focus trap implementation for accessibility
  const modalRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)
  const [selectedVariation, setSelectedVariation] =
    React.useState<ProductVariation | null>(
      variations.length > 0 ? variations[0] : null
    )
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(
    new Set()
  )
  const [quantity, setQuantity] = React.useState(1)
  const previouslyFocusedElement =
    React.useRef<HTMLElement | null>(null)

  // AIDEV-NOTE: Store previously focused element for restoration
  React.useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before modal opened
      previouslyFocusedElement.current = document.activeElement as HTMLElement
      // Focus close button when modal opens
      closeButtonRef.current?.focus()
    } else {
      // Restore focus when modal closes
      previouslyFocusedElement.current?.focus()
    }
  }, [isOpen])

  // AIDEV-NOTE: Focus trap - keep focus within modal
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Escape') return

      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Tab key - trap focus within modal
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<
          HTMLElement
        >(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Shift + Tab
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        }
        // Tab
        else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    [onClose]
  )

  const handleAddToCart = () => {
    const addonIds = Array.from(selectedAddons)
    onAddToCart?.(selectedVariation?.id, addonIds.length > 0 ? addonIds : undefined)
    onClose()
  }

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(addonId)) {
        newSet.delete(addonId)
      } else {
        newSet.add(addonId)
      }
      return newSet
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const calculateTotalPrice = () => {
    let basePrice = product.price + (selectedVariation?.price_modifier ?? 0)
    let addonsPrice = 0

    addons.forEach((addon) => {
      if (selectedAddons.has(addon.id)) {
        addonsPrice += addon.price
      }
    })

    return (basePrice + addonsPrice) * quantity
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="max-w-2xl max-h-[90vh] p-0"
        aria-describedby="product-description"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold pr-8">
              {product.name}
            </DialogTitle>
            {product.description && (
              <DialogDescription
                id="product-description"
                className="mt-2 text-sm"
              >
                {product.description}
              </DialogDescription>
            )}
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar detalhes do produto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Image */}
            {product.image_url && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image_url}
                  alt={`Imagem do produto ${product.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={false}
                  loading="lazy"
                />
              </div>
            )}

            {/* Base Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(calculateTotalPrice())}
              </span>
              {variations.length > 0 && selectedVariation && (
                <Badge variant="outline">{selectedVariation.name}</Badge>
              )}
            </div>

            {/* Variations */}
            {variations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">
                  Selecione uma variacao:
                </h3>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-label="Variacoes do produto"
                >
                  {variations.map((variation) => (
                    <button
                      key={variation.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedVariation?.id === variation.id}
                      onClick={() => setSelectedVariation(variation)}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${
                          selectedVariation?.id === variation.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{variation.name}</span>
                        <span className="text-sm font-semibold">
                          {formatPrice(product.price + variation.price_modifier)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">
                  Adicionais disponiveis:
                </h3>
                <div className="space-y-2">
                  {addons.map((addon) => (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => handleToggleAddon(addon.id)}
                      aria-pressed={selectedAddons.has(addon.id)}
                      aria-label={`Adicionar ${addon.name} por ${formatPrice(addon.price)}`}
                      className={`
                        w-full p-3 rounded-lg border-2 text-left transition-all
                        ${
                          selectedAddons.has(addon.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            h-5 w-5 rounded border-2 flex items-center justify-center
                            ${
                              selectedAddons.has(addon.id)
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }
                          `}
                          >
                            {selectedAddons.has(addon.id) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{addon.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          +{formatPrice(addon.price)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Quantidade:</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="p-6">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full"
            aria-label={`Adicionar ${quantity}x ${product.name} ao carrinho`}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Adicionar ao carrinho - {formatPrice(calculateTotalPrice())}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

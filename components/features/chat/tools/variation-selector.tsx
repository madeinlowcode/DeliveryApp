// TASK-021: Variation selector - Radio buttons for product variations
// AIDEV-NOTE: Allows users to select size/flavor variations with price modifiers

"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// AIDEV-NOTE: Variation type from product
interface Variation {
  id: string
  name: string
  priceModifier: number
}

interface VariationSelectorProps {
  variations: Variation[]
  basePrice: number
  selectedId: string | null
  onSelect: (variationId: string) => void
  className?: string
}

export function VariationSelector({
  variations,
  basePrice,
  selectedId,
  onSelect,
  className,
}: VariationSelectorProps) {
  // AIDEV-NOTE: Auto-select first variation if none selected
  const value = selectedId || variations[0]?.id || ""

  return (
    <RadioGroup
      data-slot="variation-selector"
      value={value}
      onValueChange={onSelect}
      className={cn("space-y-2", className)}
    >
      {variations.map((variation) => {
        const totalPrice = basePrice + variation.priceModifier
        const priceDisplay =
          variation.priceModifier === 0
            ? formatPrice(basePrice)
            : variation.priceModifier > 0
              ? `${formatPrice(basePrice)} + ${formatPrice(variation.priceModifier)}`
              : `${formatPrice(basePrice)} - ${formatPrice(Math.abs(variation.priceModifier))}`

        return (
          <div
            key={variation.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
              "hover:bg-accent/50 cursor-pointer",
              value === variation.id
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
            onClick={() => onSelect(variation.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(variation.id)
              }
            }}
            tabIndex={0}
            role="button"
            aria-pressed={value === variation.id}
          >
            {/* Radio button */}
            <RadioGroupItem
              value={variation.id}
              id={`variation-${variation.id}`}
              className="shrink-0"
            />

            {/* Variation name and price */}
            <div className="flex-1 flex items-center justify-between">
              <Label
                htmlFor={`variation-${variation.id}`}
                className="font-medium cursor-pointer flex-1"
              >
                {variation.name}
              </Label>

              {/* Price display */}
              <div className="flex flex-col items-end">
                <span className="font-semibold text-sm">
                  {formatPrice(totalPrice)}
                </span>
                {variation.priceModifier !== 0 && (
                  <span className="text-xs text-muted-foreground">
                    {priceDisplay}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </RadioGroup>
  )
}

// AIDEV-NOTE: Format price helper
function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export default VariationSelector

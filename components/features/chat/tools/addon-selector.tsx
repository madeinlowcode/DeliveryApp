// TASK-022: Addon selector - Checkboxes for additional items
// AIDEV-NOTE: Allows users to select extras/add-ons with prices and quantity limits

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

// AIDEV-NOTE: Addon type from product
interface Addon {
  id: string
  name: string
  price: number
  maxQuantity: number
}

// AIDEV-NOTE: Selected addon with quantity
interface SelectedAddon extends Addon {
  quantity: number
}

interface AddonSelectorProps {
  addons: Addon[]
  selectedIds: string[]
  onSelect: (addonIds: string[]) => void
  className?: string
}

export function AddonSelector({
  addons,
  selectedIds,
  onSelect,
  className,
}: AddonSelectorProps) {
  // AIDEV-NOTE: Track quantities for each addon (supports multiple of same addon)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Calculate actual selections based on quantities
  const getExpandedSelection = (): string[] => {
    const expanded: string[] = []
    Object.entries(quantities).forEach(([addonId, qty]) => {
      for (let i = 0; i < qty; i++) {
        expanded.push(addonId)
      }
    })
    return expanded
  }

  // Handle checkbox toggle (simple select/unselect)
  const handleToggle = (addonId: string, checked: boolean) => {
    const newQuantities = { ...quantities }

    if (checked) {
      // Add one quantity if checked
      newQuantities[addonId] = (newQuantities[addonId] || 0) + 1
    } else {
      // Remove all quantities if unchecked
      delete newQuantities[addonId]
    }

    setQuantities(newQuantities)
    onSelect(Object.keys(newQuantities))
  }

  // Handle quantity change for addons with maxQuantity > 1
  const handleQuantityChange = (addonId: string, delta: number) => {
    const addon = addons.find((a) => a.id === addonId)
    if (!addon) return

    const currentQty = quantities[addonId] || 0
    const newQty = Math.max(0, Math.min(addon.maxQuantity, currentQty + delta))

    const newQuantities = { ...quantities }

    if (newQty === 0) {
      delete newQuantities[addonId]
    } else {
      newQuantities[addonId] = newQty
    }

    setQuantities(newQuantities)
    onSelect(Object.keys(newQuantities))
  }

  // Get quantity for an addon
  const getQuantity = (addonId: string): number => {
    return quantities[addonId] || 0
  }

  // Check if addon is selected
  const isSelected = (addonId: string): boolean => {
    return getQuantity(addonId) > 0
  }

  return (
    <div data-slot="addon-selector" className={cn("space-y-2", className)}>
      {addons.map((addon) => {
        const qty = getQuantity(addon.id)
        const selected = isSelected(addon.id)
        const hasQuantityControl = addon.maxQuantity > 1

        return (
          <div
            key={addon.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
              "hover:bg-accent/50",
              selected ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            {/* Checkbox */}
            <Checkbox
              id={`addon-${addon.id}`}
              checked={selected}
              onCheckedChange={(checked) =>
                handleToggle(addon.id, checked === true)
              }
              className="shrink-0"
            />

            {/* Addon info */}
            <div className="flex-1">
              <Label
                htmlFor={`addon-${addon.id}`}
                className="font-medium cursor-pointer"
              >
                {addon.name}
              </Label>

              {/* Max quantity indicator */}
              {hasQuantityControl && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Máx: {addon.maxQuantity}
                </p>
              )}
            </div>

            {/* Price and quantity controls */}
            <div className="flex items-center gap-3">
              {/* Price */}
              <span className="font-semibold text-sm whitespace-nowrap">
                {addon.price > 0 ? `+ ${formatPrice(addon.price)}` : "Grátis"}
              </span>

              {/* Quantity controls for addons with maxQuantity > 1 */}
              {hasQuantityControl && selected && (
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 h-7"
                    onClick={() => handleQuantityChange(addon.id, -1)}
                    disabled={qty <= 1}
                  >
                    <Minus className="size-3" />
                    <span className="sr-only">Diminuir quantidade</span>
                  </Button>

                  <span className="w-6 text-center text-sm font-medium">
                    {qty}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 h-7"
                    onClick={() => handleQuantityChange(addon.id, 1)}
                    disabled={qty >= addon.maxQuantity}
                  >
                    <Plus className="size-3" />
                    <span className="sr-only">Aumentar quantidade</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// AIDEV-NOTE: Format price helper
function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export default AddonSelector

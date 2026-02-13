// TASK-070: Addon manager component
// AIDEV-NOTE: Manages product addons (extras, complements) with inline editing

"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AddonFormData } from "@/lib/validators/product"

interface AddonManagerProps {
  addons: AddonFormData[]
  onChange: (addons: AddonFormData[]) => void
  disabled?: boolean
}

// AIDEV-NOTE: Generate temporary ID for new addons
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

// AIDEV-NOTE: Single addon item component
function AddonItem({
  addon,
  index,
  onUpdate,
  onRemove,
  disabled,
}: {
  addon: AddonFormData
  index: number
  onUpdate: (index: number, data: Partial<AddonFormData>) => void
  onRemove: (index: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      {/* Name */}
      <div className="flex-1">
        <Input
          placeholder="Ex: Bacon extra, Queijo cheddar..."
          value={addon.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          disabled={disabled}
          className="h-8"
        />
      </div>

      {/* Price */}
      <div className="w-28">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            R$
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={addon.price || ""}
            onChange={(e) =>
              onUpdate(index, {
                price: parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            className="h-8 pl-8"
          />
        </div>
      </div>

      {/* Max Quantity */}
      <div className="w-20">
        <Input
          type="number"
          min="1"
          max="99"
          placeholder="Max"
          value={addon.max_quantity || ""}
          onChange={(e) =>
            onUpdate(index, {
              max_quantity: parseInt(e.target.value) || 1,
            })
          }
          disabled={disabled}
          className="h-8 text-center"
        />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          checked={addon.is_active}
          onCheckedChange={(checked) => onUpdate(index, { is_active: checked })}
          disabled={disabled}
        />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(index)}
        disabled={disabled}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function AddonManager({
  addons,
  onChange,
  disabled = false,
}: AddonManagerProps) {
  // AIDEV-NOTE: Add new empty addon
  const handleAdd = () => {
    const newAddon: AddonFormData = {
      id: generateTempId(),
      name: "",
      price: 0,
      max_quantity: 10,
      is_active: true,
    }
    onChange([...addons, newAddon])
  }

  // AIDEV-NOTE: Update an addon at index
  const handleUpdate = (index: number, data: Partial<AddonFormData>) => {
    const updated = [...addons]
    updated[index] = { ...updated[index], ...data }
    onChange(updated)
  }

  // AIDEV-NOTE: Remove an addon at index
  const handleRemove = (index: number) => {
    const updated = addons.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Adicionais</Label>
          <p className="text-sm text-muted-foreground">
            Complementos extras que o cliente pode adicionar
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {addons.length > 0 ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center gap-3 px-3 text-xs font-medium text-muted-foreground">
            <div className="flex-1">Nome</div>
            <div className="w-28 text-center">Preco</div>
            <div className="w-20 text-center">Qtd. max</div>
            <div className="w-12 text-center">Ativo</div>
            <div className="w-8" />
          </div>

          {/* Items */}
          {addons.map((addon, index) => (
            <AddonItem
              key={addon.id || `temp-${index}`}
              addon={addon}
              index={index}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhum adicional cadastrado. Clique em &quot;Adicionar&quot; para criar.
        </div>
      )}
    </div>
  )
}

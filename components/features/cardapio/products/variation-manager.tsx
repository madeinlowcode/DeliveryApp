// TASK-069: Variation manager component
// AIDEV-NOTE: Manages product variations (sizes, flavors) with inline editing

"use client"

import * as React from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { VariationFormData } from "@/lib/validators/product"

interface VariationManagerProps {
  variations: VariationFormData[]
  onChange: (variations: VariationFormData[]) => void
  disabled?: boolean
}

// AIDEV-NOTE: Generate temporary ID for new variations
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

// AIDEV-NOTE: Sortable variation item component
function SortableVariationItem({
  variation,
  index,
  onUpdate,
  onRemove,
  disabled,
}: {
  variation: VariationFormData
  index: number
  onUpdate: (index: number, data: Partial<VariationFormData>) => void
  onRemove: (index: number) => void
  disabled?: boolean
}) {
  const id = variation.id || `temp-${index}`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        isDragging && "shadow-lg opacity-90"
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Name */}
      <div className="flex-1">
        <Input
          placeholder="Ex: Pequena, Media, Grande..."
          value={variation.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          disabled={disabled}
          className="h-8"
        />
      </div>

      {/* Price Modifier */}
      <div className="w-28">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            R$
          </span>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={variation.price_modifier || ""}
            onChange={(e) =>
              onUpdate(index, {
                price_modifier: parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            className="h-8 pl-8"
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          checked={variation.is_active}
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

export function VariationManager({
  variations,
  onChange,
  disabled = false,
}: VariationManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // AIDEV-NOTE: Add new empty variation
  const handleAdd = () => {
    const newVariation: VariationFormData = {
      id: generateTempId(),
      name: "",
      price_modifier: 0,
      sort_order: variations.length,
      is_active: true,
    }
    onChange([...variations, newVariation])
  }

  // AIDEV-NOTE: Update a variation at index
  const handleUpdate = (index: number, data: Partial<VariationFormData>) => {
    const updated = [...variations]
    updated[index] = { ...updated[index], ...data }
    onChange(updated)
  }

  // AIDEV-NOTE: Remove a variation at index
  const handleRemove = (index: number) => {
    const updated = variations.filter((_, i) => i !== index)
    onChange(updated)
  }

  // AIDEV-NOTE: Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = variations.findIndex(
      (v, i) => (v.id || `temp-${i}`) === active.id
    )
    const newIndex = variations.findIndex(
      (v, i) => (v.id || `temp-${i}`) === over.id
    )

    const reordered = arrayMove(variations, oldIndex, newIndex).map(
      (v, i) => ({
        ...v,
        sort_order: i,
      })
    )
    onChange(reordered)
  }

  // AIDEV-NOTE: Get sortable IDs
  const sortableIds = variations.map((v, i) => v.id || `temp-${i}`)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Variacoes</Label>
          <p className="text-sm text-muted-foreground">
            Tamanhos, sabores ou outras opcoes (ex: P, M, G)
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

      {variations.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center gap-3 px-3 text-xs font-medium text-muted-foreground">
                <div className="w-4" />
                <div className="flex-1">Nome</div>
                <div className="w-28 text-center">Modificador de preco</div>
                <div className="w-12 text-center">Ativo</div>
                <div className="w-8" />
              </div>

              {/* Items */}
              {variations.map((variation, index) => (
                <SortableVariationItem
                  key={variation.id || `temp-${index}`}
                  variation={variation}
                  index={index}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhuma variacao adicionada. Clique em &quot;Adicionar&quot; para criar.
        </div>
      )}
    </div>
  )
}

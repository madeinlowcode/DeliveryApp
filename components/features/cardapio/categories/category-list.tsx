// TASK-062: Category list component with drag-to-reorder
// AIDEV-NOTE: Sortable list of categories using @dnd-kit

"use client"

import * as React from "react"
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Plus, FolderOpen } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryCard } from "./category-card"
import type { Category } from "@/types/database"

interface CategoryListProps {
  categories: Category[]
  isLoading?: boolean
  onReorder?: (categoryIds: string[]) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onToggleActive?: (id: string, isActive: boolean) => Promise<void>
}

export function CategoryList({
  categories,
  isLoading = false,
  onReorder,
  onDelete,
  onToggleActive,
}: CategoryListProps) {
  const [items, setItems] = React.useState(categories)

  // AIDEV-NOTE: Sync local state with props
  React.useEffect(() => {
    setItems(categories)
  }, [categories])

  // AIDEV-NOTE: dnd-kit sensors for mouse/touch and keyboard interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // AIDEV-NOTE: Handle drag end - reorder items and persist to database
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    // Persist the new order
    if (onReorder) {
      try {
        await onReorder(newItems.map((item) => item.id))
      } catch {
        // Rollback on error
        setItems(categories)
      }
    }
  }

  // AIDEV-NOTE: Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border p-4"
          >
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // AIDEV-NOTE: Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Nenhuma categoria</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie sua primeira categoria para organizar o cardapio.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/cardapio/categorias/novo">
            <Plus className="mr-2 h-4 w-4" />
            Criar categoria
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// AIDEV-NOTE: Export index file helper
export { CategoryCard } from "./category-card"
export { CategoryForm } from "./category-form"

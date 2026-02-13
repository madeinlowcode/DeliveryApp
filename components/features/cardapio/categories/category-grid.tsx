// TASK-044: Responsive category cards grid
// AIDEV-NOTE: 2 columns on mobile, 3 on desktop

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { Category } from "@/types/database"
import { CategoryCard } from "./category-card"

interface CategoryGridProps {
  categories: Category[]
  isLoading?: boolean
  onDelete?: (id: string) => Promise<void>
  onToggleActive?: (id: string, isActive: boolean) => Promise<void>
  className?: string
}

// AIDEV-NOTE: Responsive grid: 2 columns mobile (<768px), 3 desktop (>=768px)
export function CategoryGrid({
  categories,
  isLoading: _isLoading,
  onDelete,
  onToggleActive,
  className,
}: CategoryGridProps) {
  return (
    <div
      className={cn(
        // AIDEV-NOTE: Mobile-first responsive grid
        "grid grid-cols-2 gap-4 sm:grid-cols-3",
        className
      )}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  )
}

// AIDEV-NOTE: Grid for chat interface - single column on mobile
interface CategoryCardGridProps {
  categories: Category[]
  onSelectCategory?: (category: Category) => void
  className?: string
}

export function CategoryCardGrid({
  categories,
  onSelectCategory,
  className,
}: CategoryCardGridProps) {
  return (
    <div
      className={cn(
        // AIDEV-NOTE: Chat interface: 2 columns mobile, 4 desktop
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory?.(category)}
          className="group relative flex aspect-square flex-col items-center justify-center rounded-lg border bg-card p-4 transition-all hover:scale-105 hover:border-primary hover:shadow-md"
        >
          {/* Category Image */}
          <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
            {category.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element -- Native img for dynamic external sources */
              <img
                src={category.image_url}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            )}
          </div>

          {/* Category Name */}
          <span className="mt-2 text-center text-sm font-medium group-hover:text-primary">
            {category.name}
          </span>

          {/* Description on hover (desktop) */}
          {category.description && (
            <span className="hidden text-xs text-muted-foreground group-hover:sm:block">
              {category.description}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// TASK-017: Category cards component - clickable grid of categories
// AIDEV-NOTE: Displays menu categories in a visually appealing card grid

"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CategoryWithCount } from "@/lib/ai/ai-menu.service"

// AIDEV-NOTE: Emoji fallback for categories without images
const CATEGORY_EMOJIS: Record<string, string> = {
  default: "🍽️",
  pizza: "🍕",
  lanche: "🍔",
  burger: "🍔",
  sanduiche: "🥪",
  bebida: "🥤",
  drink: "🥤",
  refrigerante: "🥤",
  suco: "🧃",
  sobremesa: "🍰",
  doce: "🍩",
  salada: "🥗",
  massa: "🍝",
  sushi: "🍣",
  oriental: "🥢",
  mexicano: "🌮",
  taco: "🌮",
  italiana: "🇮🇹",
  brasileira: "🇧🇷",
  cafe: "☕",
  cafe_da_manha: "🍳",
  breakfast: "🍳",
}

interface CategoryCardsProps {
  categories: CategoryWithCount[]
  className?: string
  onCategoryClick?: (categoryName: string) => void
}

export function CategoryCards({
  categories,
  className,
  onCategoryClick,
}: CategoryCardsProps) {
  if (categories.length === 0) {
    return (
      <div
        data-slot="category-cards-empty"
        className={cn("text-center py-8 text-muted-foreground", className)}
      >
        <p>Nenhuma categoria disponível.</p>
      </div>
    )
  }

  return (
    <div
      data-slot="category-cards"
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 gap-3",
        className
      )}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  )
}

// AIDEV-NOTE: Individual category card
interface CategoryCardProps {
  category: CategoryWithCount
  onClick?: (categoryName: string) => void
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  // TASK-018: onClick sends "Quero ver [categoria]" via runtime.send
  const handleClick = () => {
    const message = `Quero ver ${category.name.toLowerCase()}`
    onClick?.(message)
  }

  const emoji = getCategoryEmoji(category.name)

  return (
    <Card
      data-slot="category-card"
      data-category-id={category.id}
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:scale-105 active:scale-95",
        "border-2 hover:border-primary/50"
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        // AIDEV-NOTE: Accessibility - keyboard navigation
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Ver categoria ${category.name}`}
    >
      <div className="flex flex-col items-center gap-3 py-6 px-4">
        {/* Category image or emoji fallback */}
        <div className="text-5xl group-hover:scale-110 transition-transform duration-200">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-16 h-16 object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <span>{emoji}</span>
          )}
        </div>

        {/* Category name */}
        <div className="text-center">
          <h3 className="font-semibold text-sm leading-tight">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Product count badge */}
        {category.productCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {category.productCount} {category.productCount === 1 ? "item" : "itens"}
          </span>
        )}
      </div>
    </Card>
  )
}

// AIDEV-NOTE: Get emoji for category based on name keywords
function getCategoryEmoji(categoryName: string): string {
  const normalizedName = categoryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // Check for direct matches
  if (CATEGORY_EMOJIS[normalizedName]) {
    return CATEGORY_EMOJIS[normalizedName]
  }

  // Check for partial matches
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (key !== "default" && normalizedName.includes(key)) {
      return emoji
    }
  }

  return CATEGORY_EMOJIS.default
}

// AIDEV-NOTE: Export memoized component for performance
export default CategoryCards

// TASK-063: Category cards skeleton component
// AIDEV-NOTE: Loading state for category list - maintains layout stability

'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * CategoryCardsSkeleton component
 * Displays skeleton loading state for category cards
 * Prevents layout shift and provides visual feedback during data fetching
 */
export function CategoryCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Individual category card skeleton
 */
function CategoryCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Drag Handle Skeleton */}
        <Skeleton className="h-5 w-5 shrink-0" />

        {/* Image Skeleton */}
        <Skeleton className="h-12 w-12 shrink-0 rounded-md" />

        {/* Text Skeleton */}
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex shrink-0 items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

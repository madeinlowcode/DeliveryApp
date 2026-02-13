// TASK-064: Product cards skeleton component
// AIDEV-NOTE: Loading state for product list - maintains layout stability

'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * ProductCardsSkeleton component
 * Displays skeleton loading state for product cards
 * Prevents layout shift and provides visual feedback during data fetching
 */
export function ProductCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Individual product card skeleton
 */
function ProductCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        {/* Image Skeleton */}
        <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />

        {/* Info Skeleton */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Title and Badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Description */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          {/* Price and Category */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex flex-col items-end gap-2">
          {/* Availability Toggle */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-10" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Loading skeleton for customer chat page
// Shown while tenant data is being fetched

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton component
 */
export function LoadingSkeleton() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r bg-muted/10 p-4 hidden md:block">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
      </div>

      {/* Main chat area skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="border-b p-4">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-16 max-w-md flex-1" />
          </div>
          <div className="flex gap-3 justify-end">
            <Skeleton className="h-16 max-w-md flex-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-12 max-w-sm flex-1" />
          </div>
        </div>

        {/* Composer skeleton */}
        <div className="border-t p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Default export for Next.js loading.tsx
 */
export default LoadingSkeleton

// AIDEV-NOTE: Loading skeleton for auth pages (login, register)
// Shown while authentication state is being checked
// AIDEV-NOTE: T-018 - Auth loading state improvement

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton component for auth pages
 */
export function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title skeleton */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Submit button */}
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Footer skeleton */}
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
    </div>
  )
}

export default AuthLoadingSkeleton

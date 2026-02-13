// TASK-068: Code splitting for tools using dynamic imports
// AIDEV-PERF: Lazy load tools to reduce initial bundle size

import dynamic from 'next/dynamic'

// AIDEV-PERF: Dynamic import with loading fallback
export function createDynamicImport(
  importFn: () => Promise<{ default: React.ComponentType } | React.ComponentType>,
  options?: {
    fallback?: React.ReactNode
    ssr?: boolean
  }
) {
  return dynamic(importFn, {
    loading: () =>
      options?.fallback ?? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ),
    ssr: options?.ssr ?? false,
  })
}

// AIDEV-NOTE: Temporarily commented out - components use named exports
// export const CategoryTools = createDynamicImport(
//   () => import('@/components/features/cardapio/categories/category-list'),
//   { ssr: false }
// )

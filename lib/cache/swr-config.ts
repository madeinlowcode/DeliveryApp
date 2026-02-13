// AIDEV-PERF: SWR configuration for data fetching with caching
// Provides optimized caching strategy with 5 minute cache duration

import { SWRConfiguration, mutate } from 'swr'

// Cache configuration constants
const CACHE_TIME_MS = 5 * 60 * 1000 // 5 minutes
const REVALIDATE_ON_FOCUS = true
const REVALIDATE_ON_RECONNECT = true
const RETRY_COUNT = 3
const RETRY_INTERVAL = 5000 // 5 seconds

/**
 * Default SWR configuration for the application
 * Apply this to SWRConfig provider at the app level
 */
export const swrConfig: SWRConfiguration = {
  // AIDEV-PERF: Cache data for 5 minutes before considering it stale
  dedupingInterval: CACHE_TIME_MS,

  // AIDEV-PERF: Keep data in cache while revalidating
  revalidateOnFocus: REVALIDATE_ON_FOCUS,
  revalidateOnReconnect: REVALIDATE_ON_RECONNECT,

  // AIDEV-PERF: Don't revalidate on mount if data is fresh
  revalidateIfStale: true,

  // AIDEV-NOTE: Retry configuration for failed requests
  errorRetryCount: RETRY_COUNT,
  errorRetryInterval: RETRY_INTERVAL,
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status && error.status >= 400 && error.status < 500) {
      return false
    }
    return true
  },

  // AIDEV-PERF: Focus throttle to prevent excessive revalidation
  focusThrottleInterval: 5000, // 5 seconds

  // AIDEV-NOTE: Loading timeout
  loadingTimeout: 3000, // 3 seconds

  // AIDEV-NOTE: Keep previous data while loading new
  keepPreviousData: true,

  // Global error handler
  onError: (error, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[SWR] Error fetching ${key}:`, error)
    }
  },

  // Global success handler (optional logging)
  onSuccess: (data, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[SWR] Fetched ${key}:`, data)
    }
  },
}

/**
 * SWR configuration for real-time data that needs frequent updates
 */
export const swrRealtimeConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 1000, // 1 second
  refreshInterval: 5000, // Poll every 5 seconds
  revalidateOnFocus: true,
}

/**
 * SWR configuration for static data that rarely changes
 */
export const swrStaticConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 30 * 60 * 1000, // 30 minutes
  revalidateOnFocus: false,
  revalidateIfStale: false,
}

/**
 * SWR configuration for list data with pagination
 */
export const swrListConfig: SWRConfiguration = {
  ...swrConfig,
  // Keep previous data during pagination to prevent flashing
  keepPreviousData: true,
  // Shorter deduping for lists since they change more often
  dedupingInterval: 2 * 60 * 1000, // 2 minutes
}

/**
 * Custom fetcher for SWR that works with our API structure
 */
export async function swrFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error: Error & { status?: number; info?: unknown } = new Error(
      'An error occurred while fetching the data.'
    )
    error.status = response.status
    try {
      error.info = await response.json()
    } catch {
      // Response might not be JSON
    }
    throw error
  }

  return response.json()
}

/**
 * Custom fetcher for Supabase data
 * Use this when fetching directly from Supabase
 */
export function createSupabaseFetcher(supabase: {
  from: (table: string) => {
    select: (columns?: string) => {
      eq?: (column: string, value: unknown) => Promise<{ data: unknown; error: unknown }>
    } & Promise<{ data: unknown; error: unknown }>
  }
}) {
  return async <T>(key: string): Promise<T> => {
    // Parse the key to extract table and query params
    // Format: "table:column=value" or just "table"
    const [tableAndQuery] = key.split('?')
    const [table, query] = tableAndQuery.split(':')

    let queryBuilder = supabase.from(table).select()

    if (query) {
      const [column, value] = query.split('=')
      if (queryBuilder.eq) {
        const result = await queryBuilder.eq(column, value)
        if (result.error) throw result.error
        return result.data as T
      }
    }

    const { data, error } = await queryBuilder
    if (error) throw error
    return data as T
  }
}

/**
 * Helper to invalidate cache for specific keys
 * @param keys - Array of cache keys to invalidate
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => mutate(key)))
}

/**
 * Helper to invalidate all cache entries matching a pattern
 * @param pattern - Regex pattern to match keys
 */
export async function invalidateCachePattern(pattern: RegExp): Promise<void> {
  await mutate(
    (key) => typeof key === 'string' && pattern.test(key),
    undefined,
    { revalidate: true }
  )
}

/**
 * Helper to optimistically update cache
 * @param key - Cache key
 * @param updateFn - Function to update the data
 * @param revalidate - Whether to revalidate after update
 */
export function optimisticUpdate<T>(
  key: string,
  updateFn: (currentData: T | undefined) => T,
  revalidate = true
): Promise<T | undefined> {
  return mutate(key, updateFn, {
    revalidate,
    optimisticData: updateFn,
    rollbackOnError: true,
  })
}

/**
 * Generate a cache key for entity queries
 */
export function getCacheKey(entity: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return `/api/${entity}`
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  return `/api/${entity}?${searchParams.toString()}`
}

/**
 * Generate cache keys for common entity patterns
 */
export const cacheKeys = {
  products: (tenantId: string, params?: Record<string, unknown>) =>
    getCacheKey(`tenants/${tenantId}/products`, params),
  product: (tenantId: string, productId: string) =>
    getCacheKey(`tenants/${tenantId}/products/${productId}`),
  categories: (tenantId: string, params?: Record<string, unknown>) =>
    getCacheKey(`tenants/${tenantId}/categories`, params),
  category: (tenantId: string, categoryId: string) =>
    getCacheKey(`tenants/${tenantId}/categories/${categoryId}`),
  orders: (tenantId: string, params?: Record<string, unknown>) =>
    getCacheKey(`tenants/${tenantId}/orders`, params),
  order: (tenantId: string, orderId: string) =>
    getCacheKey(`tenants/${tenantId}/orders/${orderId}`),
  auditLogs: (tenantId: string, params?: Record<string, unknown>) =>
    getCacheKey(`tenants/${tenantId}/audit-logs`, params),
}

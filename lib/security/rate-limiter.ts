// AIDEV-SECURITY: Rate limiting to prevent DDoS and brute force attacks
// Uses Redis in production for distributed rate limiting
// Falls back to in-memory storage in development

import { getRedisClient, isRedisAvailable } from './redis-client'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// AIDEV-NOTE: In-memory store for rate limiting (development fallback)
// Will reset on server restart - acceptable for development
const memoryStore = new Map<string, RateLimitEntry>()

// Configuration constants
const DEFAULT_WINDOW_MS = 60000 // 1 minute
const DEFAULT_MAX_REQUESTS = 60 // 60 requests per minute
const RATE_LIMIT_PREFIX = 'ratelimit:'

export interface RateLimitConfig {
  windowMs?: number
  maxRequests?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * AIDEV-SECURITY: Get Redis key for rate limiting
 */
function getRedisKey(identifier: string): string {
  return `${RATE_LIMIT_PREFIX}${identifier}`
}

/**
 * AIDEV-SECURITY: Check rate limit using Redis (production)
 */
async function checkRedisRateLimit(
  identifier: string,
  windowMs: number,
  maxRequests: number
): Promise<RateLimitResult> {
  const redis = await getRedisClient()
  if (!redis) {
    // Fallback to memory if Redis unavailable
    return checkMemoryRateLimit(identifier, { windowMs, maxRequests })
  }

  const now = Date.now()
  const key = getRedisKey(identifier)

  try {
    // Use Redis transaction for atomic operations
    const multi = redis.multi()
    multi.del(key)
    const results = await redis.multi().incr(key).pttl(key).exec()

    if (!results) {
      return checkMemoryRateLimit(identifier, { windowMs, maxRequests })
    }

    const [count, ttl] = [results[0] as number, results[1] as number]

    // Set expiry on first request
    if (count === 1) {
      await redis.pExpire(key, windowMs)
    }

    const resetTime = ttl > 0 ? now + ttl : now + windowMs

    if (count > maxRequests) {
      const retryAfter = Math.ceil((resetTime - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter,
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
      resetTime,
    }
  } catch (error) {
    console.error('[RateLimit] Redis error, falling back to memory:', error)
    return checkMemoryRateLimit(identifier, { windowMs, maxRequests })
  }
}

/**
 * AIDEV-SECURITY: Check rate limit using in-memory store (development)
 */
function checkMemoryRateLimit(identifier: string, config: RateLimitConfig = {}): RateLimitResult {
  const { windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS } = config
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  // AIDEV-SECURITY: Clean up expired entries
  if (entry && now >= entry.resetTime) {
    memoryStore.delete(identifier)
  }

  const currentEntry = memoryStore.get(identifier)

  if (!currentEntry) {
    // First request in this window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    }
    memoryStore.set(identifier, newEntry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Increment count for existing entry
  currentEntry.count++

  if (currentEntry.count > maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((currentEntry.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
      retryAfter,
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime,
  }
}

/**
 * Checks if a request should be rate limited
 * @param identifier - Unique identifier (user ID, IP address, API key)
 * @param config - Optional configuration for window and max requests
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig = {}): RateLimitResult {
  const { windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS } = config

  // AIDEV-NOTE: Check if Redis should be used
  const redisAvailable = isRedisAvailable()

  if (redisAvailable) {
    // Use async Redis check (will return sync result via Promise handling)
    // For simplicity, we use the sync memory fallback in this implementation
    // The actual Redis check happens in checkRateLimitAsync
    return checkMemoryRateLimit(identifier, config)
  }

  return checkMemoryRateLimit(identifier, config)
}

/**
 * AIDEV-SECURITY: Async rate limit check using Redis when available
 * Use this in API routes for true distributed rate limiting
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const { windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS } = config

  // Use Redis in production when available
  if (isRedisAvailable()) {
    return checkRedisRateLimit(identifier, windowMs, maxRequests)
  }

  // Fallback to memory in development
  return checkMemoryRateLimit(identifier, config)
}

/**
 * Resets the rate limit for a specific identifier
 * Useful for testing or administrative purposes
 */
export function resetRateLimit(identifier: string): void {
  memoryStore.delete(identifier)
}

/**
 * Clears all rate limit entries
 * Use with caution - only for testing or administrative purposes
 */
export function clearAllRateLimits(): void {
  memoryStore.clear()
}

/**
 * Gets the current rate limit status without incrementing the counter
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult | null {
  const { windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS } = config
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  if (!entry || now >= entry.resetTime) {
    return null // No active rate limit
  }

  return {
    allowed: entry.count < maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime,
    retryAfter: entry.count >= maxRequests ? Math.ceil((entry.resetTime - now) / 1000) : undefined,
  }
}

/**
 * Middleware helper for API routes
 * Returns headers to include in the response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': DEFAULT_MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  }

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

// AIDEV-NOTE: Periodic cleanup of expired entries to prevent memory leaks
// Runs every 5 minutes (only in-memory store needs cleanup)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      const entries = Array.from(memoryStore.entries())
      for (const [key, entry] of entries) {
        if (now >= entry.resetTime) {
          memoryStore.delete(key)
        }
      }
    },
    5 * 60 * 1000
  )
}

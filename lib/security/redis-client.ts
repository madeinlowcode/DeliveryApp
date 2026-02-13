// AIDEV-SECURITY: Redis client for distributed rate limiting
// Uses Redis in production for multi-instance deployments
// Falls back to in-memory storage in development

import { createClient, type RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null
let isRedisConnected = false
let useRedis = false

// AIDEV-NOTE: Check if Redis should be used (production only)
function shouldUseRedis(): boolean {
  // Only use Redis in production or when explicitly configured
  if (process.env.NODE_ENV === 'production') {
    return !!process.env.REDIS_URL || !!process.env.REDIS_HOST
  }
  return false
}

/**
 * Initialize Redis client connection
 * Returns singleton instance
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  // Check if we should use Redis
  if (!shouldUseRedis()) {
    if (!useRedis) {
      console.log('[Redis] Using in-memory store (development mode)')
      useRedis = true
    }
    return null
  }

  // Return existing client if already connected
  if (redisClient && isRedisConnected) {
    return redisClient
  }

  try {
    const redisUrl =
      process.env.REDIS_URL ||
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('[Redis] Max reconnection attempts reached')
            return new Error('Max reconnection attempts reached')
          }
          return Math.min(retries * 100, 3000)
        },
      },
    })

    redisClient.on('error', (err) => {
      console.error('[Redis] Client error:', err)
      isRedisConnected = false
    })

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully')
      isRedisConnected = true
    })

    redisClient.on('disconnect', () => {
      console.log('[Redis] Disconnected')
      isRedisConnected = false
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('[Redis] Failed to connect:', error)
    isRedisConnected = false
    return null
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return isRedisConnected && redisClient !== null
}

/**
 * Get Redis client status for debugging
 */
export function getRedisStatus(): { connected: boolean; usingRedis: boolean } {
  return {
    connected: isRedisConnected,
    usingRedis: shouldUseRedis(),
  }
}

/**
 * Close Redis connection
 * Call this on server shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    isRedisConnected = false
  }
}

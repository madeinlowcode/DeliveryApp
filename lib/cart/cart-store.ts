// TASK-015: Cart store with Map<string, Cart>
// AIDEV-NOTE: In-memory storage for shopping carts indexed by sessionId
// This is suitable for single-server deployments. For multi-server, use Redis.

import type { Cart } from "@/types/cart"

// AIDEV-NOTE: Global cart storage using Map for O(1) lookups
// Key: sessionId, Value: Cart object
const cartStore = new Map<string, Cart>()

// AIDEV-NOTE: Cart expiration time in milliseconds (2 hours)
const CART_EXPIRATION_MS = 2 * 60 * 60 * 1000

// AIDEV-NOTE: Last cleanup timestamp to avoid excessive cleanup runs
let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Get a cart from the store by sessionId
 * @param sessionId - Unique session identifier
 * @returns Cart or undefined if not found
 */
export function getCartFromStore(sessionId: string): Cart | undefined {
  maybeCleanupExpiredCarts()
  return cartStore.get(sessionId)
}

/**
 * Set/update a cart in the store
 * @param sessionId - Unique session identifier
 * @param cart - Cart object to store
 */
export function setCartInStore(sessionId: string, cart: Cart): void {
  cartStore.set(sessionId, cart)
}

/**
 * Delete a cart from the store
 * @param sessionId - Unique session identifier
 * @returns true if cart was deleted, false if it didn't exist
 */
export function deleteCartFromStore(sessionId: string): boolean {
  return cartStore.delete(sessionId)
}

/**
 * Check if a cart exists in the store
 * @param sessionId - Unique session identifier
 */
export function hasCartInStore(sessionId: string): boolean {
  return cartStore.has(sessionId)
}

/**
 * Get all session IDs with active carts
 * AIDEV-NOTE: Use sparingly, mainly for admin/debugging purposes
 */
export function getAllCartSessionIds(): string[] {
  return Array.from(cartStore.keys())
}

/**
 * Get total number of carts in store
 */
export function getCartCount(): number {
  return cartStore.size
}

/**
 * Clear all carts from store
 * AIDEV-NOTE: Use with caution, mainly for testing or emergency cleanup
 */
export function clearAllCarts(): void {
  cartStore.clear()
}

/**
 * Cleanup expired carts periodically
 * AIDEV-NOTE: Called automatically on get operations, but throttled
 */
function maybeCleanupExpiredCarts(): void {
  const now = Date.now()

  // Only run cleanup if enough time has passed
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return
  }

  lastCleanup = now
  const expirationThreshold = now - CART_EXPIRATION_MS

  for (const [sessionId, cart] of cartStore.entries()) {
    if (cart.updatedAt.getTime() < expirationThreshold) {
      cartStore.delete(sessionId)
    }
  }
}

/**
 * Force cleanup of expired carts
 * AIDEV-NOTE: Can be called from a scheduled job if needed
 */
export function forceCleanupExpiredCarts(): number {
  const now = Date.now()
  const expirationThreshold = now - CART_EXPIRATION_MS
  let deletedCount = 0

  for (const [sessionId, cart] of cartStore.entries()) {
    if (cart.updatedAt.getTime() < expirationThreshold) {
      cartStore.delete(sessionId)
      deletedCount++
    }
  }

  lastCleanup = now
  return deletedCount
}

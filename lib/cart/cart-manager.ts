// TASK-016 to TASK-020: CartManager class implementation
// AIDEV-NOTE: Manages shopping cart operations with automatic price calculations

import type {
  Cart,
  CartItem,
  CartItemAddon,
  CartAddItemInput,
  CartSummary,
  CartItemSummary,
} from "@/types/cart"
import {
  getCartFromStore,
  setCartInStore,
  deleteCartFromStore,
} from "./cart-store"

// AIDEV-NOTE: Generate unique IDs for cart items
function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * CartManager class - handles all cart operations for a session
 * AIDEV-NOTE: Use getInstance() to get a CartManager for a specific session
 */
export class CartManager {
  private sessionId: string
  private establishmentId: string

  private constructor(sessionId: string, establishmentId: string) {
    this.sessionId = sessionId
    this.establishmentId = establishmentId
  }

  /**
   * Get a CartManager instance for a session
   * TASK-016: Static factory method
   * @param sessionId - Unique session identifier
   * @param establishmentId - Establishment this cart belongs to
   */
  static getInstance(sessionId: string, establishmentId: string = ""): CartManager {
    return new CartManager(sessionId, establishmentId)
  }

  /**
   * Get the current cart or create a new one
   * AIDEV-NOTE: Internal method to ensure cart exists
   */
  private getOrCreateCart(): Cart {
    let cart = getCartFromStore(this.sessionId)

    if (!cart) {
      const now = new Date()
      cart = {
        sessionId: this.sessionId,
        establishmentId: this.establishmentId,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      setCartInStore(this.sessionId, cart)
    }

    return cart
  }

  /**
   * Calculate item total including variation and addons
   * AIDEV-NOTE: Used by addItem to compute correct pricing
   */
  private calculateItemTotal(
    basePrice: number,
    quantity: number,
    variationPriceModifier: number,
    addons: CartItemAddon[]
  ): number {
    // Base price + variation modifier
    const unitPrice = basePrice + variationPriceModifier

    // Addon total for one unit
    const addonTotal = addons.reduce((sum, addon) => sum + addon.subtotal, 0)

    // Total = (unit price * quantity) + (addon total per unit * quantity)
    return (unitPrice * quantity) + (addonTotal * quantity)
  }

  /**
   * Recalculate cart totals
   * AIDEV-NOTE: Called after any cart modification
   */
  private recalculateTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    cart.total = cart.subtotal + cart.deliveryFee
    cart.updatedAt = new Date()
  }

  /**
   * TASK-017: Add item to cart with price calculation
   * @param input - Item details to add
   * @returns The created CartItem
   */
  addItem(input: CartAddItemInput): CartItem {
    const cart = this.getOrCreateCart()
    const now = new Date()

    // AIDEV-NOTE: Process addons with subtotal calculation
    const processedAddons: CartItemAddon[] = (input.addons || []).map((addon) => ({
      addonId: addon.addonId,
      addonName: addon.addonName,
      price: addon.price,
      quantity: addon.quantity,
      subtotal: addon.price * addon.quantity,
    }))

    const variationModifier = input.variationPriceModifier || 0

    // Calculate item total
    const itemTotal = this.calculateItemTotal(
      input.basePrice,
      input.quantity,
      variationModifier,
      processedAddons
    )

    // Create the cart item
    const cartItem: CartItem = {
      id: generateItemId(),
      productId: input.productId,
      productName: input.productName,
      basePrice: input.basePrice,
      quantity: input.quantity,
      variationId: input.variationId,
      variationName: input.variationName,
      variationPriceModifier: variationModifier,
      addons: processedAddons,
      notes: input.notes,
      itemTotal,
      createdAt: now,
      updatedAt: now,
    }

    // Add to cart and recalculate
    cart.items.push(cartItem)
    this.recalculateTotals(cart)
    setCartInStore(this.sessionId, cart)

    return cartItem
  }

  /**
   * TASK-018: Remove item from cart and recalculate totals
   * @param itemId - ID of the item to remove
   * @throws Error if item not found
   */
  removeItem(itemId: string): void {
    const cart = this.getOrCreateCart()

    const itemIndex = cart.items.findIndex((item) => item.id === itemId)
    if (itemIndex === -1) {
      throw new Error(`Cart item with id '${itemId}' not found`)
    }

    // Remove the item
    cart.items.splice(itemIndex, 1)

    // Recalculate totals
    this.recalculateTotals(cart)
    setCartInStore(this.sessionId, cart)
  }

  /**
   * Update item quantity
   * AIDEV-NOTE: Helper method to change quantity without removing/re-adding
   * @param itemId - ID of the item to update
   * @param newQuantity - New quantity (must be > 0)
   */
  updateItemQuantity(itemId: string, newQuantity: number): CartItem {
    if (newQuantity <= 0) {
      throw new Error("Quantity must be greater than 0. Use removeItem() to remove.")
    }

    const cart = this.getOrCreateCart()
    const item = cart.items.find((i) => i.id === itemId)

    if (!item) {
      throw new Error(`Cart item with id '${itemId}' not found`)
    }

    item.quantity = newQuantity
    item.itemTotal = this.calculateItemTotal(
      item.basePrice,
      item.quantity,
      item.variationPriceModifier,
      item.addons
    )
    item.updatedAt = new Date()

    this.recalculateTotals(cart)
    setCartInStore(this.sessionId, cart)

    return item
  }

  /**
   * TASK-019: Get the current cart with all totals
   * @returns Cart object with items, subtotal, deliveryFee, and total
   */
  getCart(): Cart {
    return this.getOrCreateCart()
  }

  /**
   * Get cart summary for display
   * AIDEV-NOTE: Returns a simplified view suitable for AI responses
   */
  getCartSummary(): CartSummary {
    const cart = this.getOrCreateCart()

    const items: CartItemSummary[] = cart.items.map((item) => {
      const unitPrice = item.basePrice + item.variationPriceModifier
      const addonNames = item.addons.map(
        (a) => `${a.addonName}${a.quantity > 1 ? ` x${a.quantity}` : ""}`
      )

      return {
        id: item.id,
        name: item.productName,
        quantity: item.quantity,
        unitPrice,
        total: item.itemTotal,
        variation: item.variationName,
        addons: addonNames.length > 0 ? addonNames : undefined,
        notes: item.notes,
      }
    })

    return {
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      items,
    }
  }

  /**
   * Set the delivery fee for the cart
   * @param fee - Delivery fee amount
   */
  setDeliveryFee(fee: number): void {
    const cart = this.getOrCreateCart()
    cart.deliveryFee = fee
    this.recalculateTotals(cart)
    setCartInStore(this.sessionId, cart)
  }

  /**
   * TASK-020: Clear the cart after checkout
   * AIDEV-NOTE: Removes all items and resets totals
   */
  clear(): void {
    deleteCartFromStore(this.sessionId)
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    const cart = getCartFromStore(this.sessionId)
    return !cart || cart.items.length === 0
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    const cart = getCartFromStore(this.sessionId)
    return cart?.itemCount || 0
  }
}

// AIDEV-NOTE: Cart types for the AI Agent shopping cart system
// Stub types created by Agent 2 - Agent 1 may extend these

import type { Product, ProductVariation, ProductAddon } from "./database"

// AIDEV-NOTE: Input type for adding items to cart
export interface CartAddItemInput {
  productId: string
  productName: string
  basePrice: number
  quantity: number
  variationId?: string
  variationName?: string
  variationPriceModifier?: number
  addons?: CartAddonInput[]
  notes?: string
}

// AIDEV-NOTE: Input for addon selection
export interface CartAddonInput {
  addonId: string
  addonName: string
  price: number
  quantity: number
}

// AIDEV-NOTE: Cart item stored in memory
export interface CartItem {
  id: string
  productId: string
  productName: string
  basePrice: number
  quantity: number
  variationId?: string
  variationName?: string
  variationPriceModifier: number
  addons: CartItemAddon[]
  notes?: string
  itemTotal: number
  createdAt: Date
  updatedAt: Date
}

// AIDEV-NOTE: Addon attached to a cart item
export interface CartItemAddon {
  addonId: string
  addonName: string
  price: number
  quantity: number
  subtotal: number
}

// AIDEV-NOTE: Full cart with calculated totals
export interface Cart {
  sessionId: string
  establishmentId: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

// AIDEV-NOTE: Cart summary for display
export interface CartSummary {
  itemCount: number
  subtotal: number
  deliveryFee: number
  total: number
  items: CartItemSummary[]
}

// AIDEV-NOTE: Simplified cart item for display
export interface CartItemSummary {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  variation?: string
  addons?: string[]
  notes?: string
}

// AIDEV-NOTE: Tenant/Establishment type for system prompt generation
export interface Tenant {
  id: string
  name: string
  slug: string
  logoUrl?: string
  address?: string
  phone?: string
  email?: string
  businessHours?: BusinessHours
  deliveryFee?: number
  minimumOrder?: number
  isActive: boolean
}

// AIDEV-NOTE: Business hours configuration
export interface BusinessHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

export interface DayHours {
  open: string  // HH:mm format
  close: string // HH:mm format
  isClosed?: boolean
}

// AIDEV-NOTE: Input for updating a cart item
export interface CartUpdateItemInput {
  cartItemId: string
  quantity?: number
  variationId?: string
  addons?: CartAddonInput[]
  notes?: string
}

// AIDEV-NOTE: Input for removing an item from the cart
export interface CartRemoveItemInput {
  cartItemId: string
}

// AIDEV-NOTE: Input for setting customer information
export interface CartCustomerInput {
  customerName: string
  customerPhone: string
  customerAddress?: string
}

// AIDEV-NOTE: Input for finalizing/creating an order from cart
export interface CartCheckoutInput {
  paymentMethod: string
  notes?: string
}

// AIDEV-NOTE: Helper function to calculate cart item total
export function calculateCartItemTotal(
  basePrice: number,
  quantity: number,
  variationPriceModifier: number = 0,
  addons: CartItemAddon[] = []
): number {
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.subtotal, 0)
  return (basePrice + variationPriceModifier + addonsTotal) * quantity
}

// AIDEV-NOTE: Helper function to calculate cart totals
export function calculateCartTotals(
  items: CartItem[],
  deliveryFee: number = 0
): { subtotal: number; total: number; itemCount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = subtotal + deliveryFee

  return {
    subtotal,
    total: Math.max(0, total),
    itemCount,
  }
}

// AIDEV-NOTE: Helper to create empty cart
export function createEmptyCart(establishmentId: string, sessionId: string): Cart {
  return {
    sessionId,
    establishmentId,
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// AIDEV-NOTE: Format cart summary for AI response
export function formatCartSummary(cart: Cart): string {
  if (cart.items.length === 0) {
    return "Seu carrinho esta vazio."
  }

  const lines: string[] = ["Itens no carrinho:"]

  cart.items.forEach((item, index) => {
    let line = `${index + 1}. ${item.productName}`
    if (item.variationName) {
      line += ` (${item.variationName})`
    }
    line += ` x${item.quantity} - R$ ${item.itemTotal.toFixed(2)}`
    lines.push(line)

    if (item.addons && item.addons.length > 0) {
      const addonNames = item.addons.map((a) => `+${a.addonName}`).join(", ")
      lines.push(`   Adicionais: ${addonNames}`)
    }

    if (item.notes) {
      lines.push(`   Obs: ${item.notes}`)
    }
  })

  lines.push("")
  lines.push(`Subtotal: R$ ${cart.subtotal.toFixed(2)}`)

  if (cart.deliveryFee > 0) {
    lines.push(`Taxa de entrega: R$ ${cart.deliveryFee.toFixed(2)}`)
  }

  lines.push(`Total: R$ ${cart.total.toFixed(2)}`)

  return lines.join("\n")
}

// AIDEV-NOTE: Convert cart to order format
export function cartToOrderFormat(cart: Cart, customer: CartCustomerInput) {
  return {
    establishmentId: cart.establishmentId,
    customerName: customer.customerName,
    customerPhone: customer.customerPhone,
    customerAddress: customer.customerAddress,
    total: cart.total,
    items: cart.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.basePrice + item.variationPriceModifier,
      notes: item.notes,
    })),
  }
}

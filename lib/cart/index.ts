// AIDEV-NOTE: Cart module barrel export
// Re-exports all cart-related functionality

export { CartManager } from "./cart-manager"
export {
  getCartFromStore,
  setCartInStore,
  deleteCartFromStore,
  hasCartInStore,
  getAllCartSessionIds,
  getCartCount,
  clearAllCarts,
  forceCleanupExpiredCarts,
} from "./cart-store"

// Re-export types for convenience
export type {
  Cart,
  CartItem,
  CartItemAddon,
  CartAddItemInput,
  CartAddonInput,
  CartSummary,
  CartItemSummary,
  CartUpdateItemInput,
  CartRemoveItemInput,
  CartCustomerInput,
  CartCheckoutInput,
  Tenant,
  BusinessHours,
  DayHours,
} from "@/types/cart"

// Re-export helper functions
export {
  calculateCartItemTotal,
  calculateCartTotals,
  createEmptyCart,
  formatCartSummary,
  cartToOrderFormat,
} from "@/types/cart"

// TASK-040: Tools barrel export
// AIDEV-NOTE: Export all AI tool factory functions for use in the chat route

export { createGetCategoriesTool } from "./get-categories"
export { createGetProductsTool } from "./get-products"
export { createCheckHoursTool } from "./check-hours"
export { createAddToCartTool } from "./add-to-cart"
export { createRemoveFromCartTool } from "./remove-from-cart"
export { createGetCartTool } from "./get-cart"
export { createCheckoutTool } from "./checkout"
export { createGetOrderStatusTool } from "./get-order-status"

// AIDEV-NOTE: Re-export context types for convenience
export type { ToolContext } from "./get-categories"
export type { CheckHoursContext } from "./check-hours"
export type { CheckoutContext } from "./checkout"

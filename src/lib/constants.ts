// AIDEV-NOTE: Application-wide constants for the delivery system
// These constants define the business rules and status flows

// Order Status Flow: pending -> confirmed -> preparing -> ready -> delivering -> delivered
// Can also go to: cancelled (from any status except delivered)
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

// AIDEV-NOTE: Human-readable labels for order statuses (Portuguese)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Pendente',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmado',
  [ORDER_STATUSES.PREPARING]: 'Preparando',
  [ORDER_STATUSES.READY]: 'Pronto',
  [ORDER_STATUSES.DELIVERING]: 'Em Entrega',
  [ORDER_STATUSES.DELIVERED]: 'Entregue',
  [ORDER_STATUSES.CANCELLED]: 'Cancelado',
}

// AIDEV-NOTE: Colors for order status badges
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PREPARING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUSES.READY]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUSES.DELIVERING]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUSES.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
}

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  CASH: 'cash',
  VOUCHER: 'voucher',
} as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Cartao de Credito',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Cartao de Debito',
  [PAYMENT_METHODS.PIX]: 'PIX',
  [PAYMENT_METHODS.CASH]: 'Dinheiro',
  [PAYMENT_METHODS.VOUCHER]: 'Vale Refeicao',
}

// Delivery Types
export const DELIVERY_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  DINE_IN: 'dine_in',
} as const

export type DeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES]

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  [DELIVERY_TYPES.DELIVERY]: 'Delivery',
  [DELIVERY_TYPES.PICKUP]: 'Retirada',
  [DELIVERY_TYPES.DINE_IN]: 'Comer no Local',
}

// Days of Week
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const

export const DAYS_OF_WEEK_LABELS: Record<number, string> = {
  [DAYS_OF_WEEK.SUNDAY]: 'Domingo',
  [DAYS_OF_WEEK.MONDAY]: 'Segunda-feira',
  [DAYS_OF_WEEK.TUESDAY]: 'Terca-feira',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Quarta-feira',
  [DAYS_OF_WEEK.THURSDAY]: 'Quinta-feira',
  [DAYS_OF_WEEK.FRIDAY]: 'Sexta-feira',
  [DAYS_OF_WEEK.SATURDAY]: 'Sabado',
}

// AIDEV-NOTE: Application routes for navigation
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Admin Panel
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_MENU: '/admin/menu',
  ADMIN_CATEGORIES: '/admin/menu/categories',
  ADMIN_PRODUCTS: '/admin/menu/products',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_BUSINESS_HOURS: '/admin/settings/hours',
  ADMIN_PAYMENT_METHODS: '/admin/settings/payments',

  // Customer
  MENU: '/menu',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
} as const

// AIDEV-NOTE: API routes for data fetching
export const API_ROUTES = {
  CATEGORIES: '/api/categories',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  CUSTOMERS: '/api/customers',
  BUSINESS_HOURS: '/api/business-hours',
  PAYMENT_METHODS: '/api/payment-methods',
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

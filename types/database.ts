// AIDEV-NOTE: Database types generated from Supabase schema
// Auto-generated types for type-safe database operations

import type { Database as GeneratedDatabase } from './generated/database'

// AIDEV-NOTE: Re-export types from generated file
export type Json = GeneratedDatabase['public']['Tables'][string]['Row'][string]

export type DeliveryType = 'delivery' | 'pickup' | 'dine_in'
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher'
export type UserRole = 'owner' | 'admin' | 'manager' | 'staff'

export interface Tenant {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  description: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  logo_url: string | null
  banner_url: string | null
  primary_color: string | null
  is_active: boolean
  is_open: boolean
  delivery_fee: number | null
  min_order_value: number | null
  estimated_delivery_time: number | null
  delivery_radius_km: number | null
  metadata: Json | null
}

export interface BusinessHours {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  day_of_week: number
  opens_at: string
  closes_at: string
  is_closed: boolean
  metadata: Json | null
}

export interface User {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  is_active: boolean
  metadata: Json | null
}

export interface Customer {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  name: string
  email: string | null
  phone: string
  cpf: string | null
  notes: string | null
  total_orders: number
  total_spent: number
  last_order_at: string | null
  is_active: boolean
  metadata: Json | null
}

export interface CustomerAddress {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  customer_id: string
  label: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zip: string
  reference: string | null
  latitude: number | null
  longitude: number | null
  is_default: boolean
  is_active: boolean
  metadata: Json | null
}

export interface Category {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  metadata: Json | null
}

export interface Product {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null
  price: number
  promotional_price: number | null
  sort_order: number
  is_active: boolean
  is_featured: boolean
  is_available: boolean
  available_from: string | null
  available_until: string | null
  available_days: number[] | null
  track_stock: boolean
  stock_quantity: number | null
  has_variations: boolean
  has_addons: boolean
  metadata: Json | null
}

export interface ProductVariation {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  product_id: string
  name: string
  description: string | null
  price: number
  promotional_price: number | null
  sort_order: number
  is_active: boolean
  track_stock: boolean
  stock_quantity: number | null
  metadata: Json | null
}

export interface AddonGroup {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  product_id: string
  name: string
  description: string | null
  min_selections: number
  max_selections: number
  is_required: boolean
  sort_order: number
  is_active: boolean
  metadata: Json | null
}

export interface ProductAddon {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  addon_group_id: string
  name: string
  description: string | null
  image_url: string | null
  price: number
  sort_order: number
  is_active: boolean
  is_default: boolean
  track_stock: boolean
  stock_quantity: number | null
  metadata: Json | null
}

export interface Order {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  customer_id: string
  order_number: number
  status: OrderStatus
  delivery_type: DeliveryType
  payment_method: PaymentMethodType
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  notes: string | null
  delivery_address: Json | null
  estimated_delivery_at: string | null
  confirmed_at: string | null
  preparing_at: string | null
  ready_at: string | null
  delivering_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  metadata: Json | null
}

export interface OrderItem {
  id: string
  created_at: string
  order_id: string
  product_id: string
  product_name: string
  variation_id: string | null
  variation_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  addons: Json | null
  metadata: Json | null
}

export interface PaymentMethod {
  id: string
  created_at: string
  updated_at: string
  tenant_id: string
  type: PaymentMethodType
  name: string
  is_active: boolean
  accepts_change: boolean
  metadata: Json | null
}

// AIDEV-NOTE: Helper types for easier access
export type Tables<T extends keyof GeneratedDatabase['public']['Tables']> =
  GeneratedDatabase['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof GeneratedDatabase['public']['Tables']> =
  GeneratedDatabase['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof GeneratedDatabase['public']['Tables']> =
  GeneratedDatabase['public']['Tables'][T]['Update']

// AIDEV-NOTE: Type aliases matching old naming convention for backward compatibility
export type Establishment = Tenant
export type ProductWithRelations = Product & {
  category?: Category
  variations?: ProductVariation[]
  addons?: ProductAddon[]
}
export type CategoryWithProducts = Category & {
  products?: Product[]
}

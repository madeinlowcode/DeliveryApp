// AIDEV-NOTE: TypeScript types for Supabase database schema
// These types ensure type safety when interacting with the database

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// User role enum matching database
export type UserRole = 'owner' | 'admin' | 'manager' | 'staff'

// Order status enum
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

// Payment method enum
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher'

// Delivery type enum
export type DeliveryType = 'delivery' | 'pickup' | 'dine_in'

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
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
          primary_color: string
          is_active: boolean
          is_open: boolean
          delivery_fee: number
          min_order_value: number
          estimated_delivery_time: number
          delivery_radius_km: number | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          logo_url?: string | null
          banner_url?: string | null
          primary_color?: string
          is_active?: boolean
          is_open?: boolean
          delivery_fee?: number
          min_order_value?: number
          estimated_delivery_time?: number
          delivery_radius_km?: number | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          logo_url?: string | null
          banner_url?: string | null
          primary_color?: string
          is_active?: boolean
          is_open?: boolean
          delivery_fee?: number
          min_order_value?: number
          estimated_delivery_time?: number
          delivery_radius_km?: number | null
          metadata?: Json
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tenant_id: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: UserRole
          is_active: boolean
          metadata: Json
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          metadata?: Json
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tenant_id: string
          name: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          name: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          metadata?: Json
        }
      }
      products: {
        Row: {
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
          available_days: number[]
          track_stock: boolean
          stock_quantity: number
          has_variations: boolean
          has_addons: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          category_id: string
          name: string
          description?: string | null
          image_url?: string | null
          price?: number
          promotional_price?: number | null
          sort_order?: number
          is_active?: boolean
          is_featured?: boolean
          is_available?: boolean
          available_from?: string | null
          available_until?: string | null
          available_days?: number[]
          track_stock?: boolean
          stock_quantity?: number
          has_variations?: boolean
          has_addons?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          category_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          price?: number
          promotional_price?: number | null
          sort_order?: number
          is_active?: boolean
          is_featured?: boolean
          is_available?: boolean
          available_from?: string | null
          available_until?: string | null
          available_days?: number[]
          track_stock?: boolean
          stock_quantity?: number
          has_variations?: boolean
          has_addons?: boolean
          metadata?: Json
        }
      }
      product_variations: {
        Row: {
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
          stock_quantity: number
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          product_id: string
          name: string
          description?: string | null
          price?: number
          promotional_price?: number | null
          sort_order?: number
          is_active?: boolean
          track_stock?: boolean
          stock_quantity?: number
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          product_id?: string
          name?: string
          description?: string | null
          price?: number
          promotional_price?: number | null
          sort_order?: number
          is_active?: boolean
          track_stock?: boolean
          stock_quantity?: number
          metadata?: Json
        }
      }
      addon_groups: {
        Row: {
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
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          product_id: string
          name: string
          description?: string | null
          min_selections?: number
          max_selections?: number
          is_required?: boolean
          sort_order?: number
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          product_id?: string
          name?: string
          description?: string | null
          min_selections?: number
          max_selections?: number
          is_required?: boolean
          sort_order?: number
          is_active?: boolean
          metadata?: Json
        }
      }
      product_addons: {
        Row: {
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
          stock_quantity: number
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          addon_group_id: string
          name: string
          description?: string | null
          image_url?: string | null
          price?: number
          sort_order?: number
          is_active?: boolean
          is_default?: boolean
          track_stock?: boolean
          stock_quantity?: number
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          addon_group_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          price?: number
          sort_order?: number
          is_active?: boolean
          is_default?: boolean
          track_stock?: boolean
          stock_quantity?: number
          metadata?: Json
        }
      }
      customers: {
        Row: {
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
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          name: string
          email?: string | null
          phone: string
          cpf?: string | null
          notes?: string | null
          total_orders?: number
          total_spent?: number
          last_order_at?: string | null
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          name?: string
          email?: string | null
          phone?: string
          cpf?: string | null
          notes?: string | null
          total_orders?: number
          total_spent?: number
          last_order_at?: string | null
          is_active?: boolean
          metadata?: Json
        }
      }
      customer_addresses: {
        Row: {
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
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          customer_id: string
          label?: string
          street: string
          number: string
          complement?: string | null
          neighborhood: string
          city: string
          state: string
          zip: string
          reference?: string | null
          latitude?: number | null
          longitude?: number | null
          is_default?: boolean
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          customer_id?: string
          label?: string
          street?: string
          number?: string
          complement?: string | null
          neighborhood?: string
          city?: string
          state?: string
          zip?: string
          reference?: string | null
          latitude?: number | null
          longitude?: number | null
          is_default?: boolean
          is_active?: boolean
          metadata?: Json
        }
      }
      orders: {
        Row: {
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
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          customer_id: string
          order_number?: number
          status?: OrderStatus
          delivery_type?: DeliveryType
          payment_method: PaymentMethodType
          subtotal?: number
          delivery_fee?: number
          discount?: number
          total?: number
          notes?: string | null
          delivery_address?: Json | null
          estimated_delivery_at?: string | null
          confirmed_at?: string | null
          preparing_at?: string | null
          ready_at?: string | null
          delivering_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          customer_id?: string
          order_number?: number
          status?: OrderStatus
          delivery_type?: DeliveryType
          payment_method?: PaymentMethodType
          subtotal?: number
          delivery_fee?: number
          discount?: number
          total?: number
          notes?: string | null
          delivery_address?: Json | null
          estimated_delivery_at?: string | null
          confirmed_at?: string | null
          preparing_at?: string | null
          ready_at?: string | null
          delivering_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          metadata?: Json
        }
      }
      order_items: {
        Row: {
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
          addons: Json
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          product_name: string
          variation_id?: string | null
          variation_name?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          notes?: string | null
          addons?: Json
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          product_name?: string
          variation_id?: string | null
          variation_name?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          notes?: string | null
          addons?: Json
          metadata?: Json
        }
      }
      business_hours: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tenant_id: string
          day_of_week: number
          opens_at: string
          closes_at: string
          is_closed: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          day_of_week: number
          opens_at: string
          closes_at: string
          is_closed?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          day_of_week?: number
          opens_at?: string
          closes_at?: string
          is_closed?: boolean
          metadata?: Json
        }
      }
      payment_methods: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tenant_id: string
          type: PaymentMethodType
          name: string
          is_active: boolean
          accepts_change: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id: string
          type: PaymentMethodType
          name: string
          is_active?: boolean
          accepts_change?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tenant_id?: string
          type?: PaymentMethodType
          name?: string
          is_active?: boolean
          accepts_change?: boolean
          metadata?: Json
        }
      }
    }
    Functions: {
      get_user_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
      user_has_role: {
        Args: { required_role: UserRole }
        Returns: boolean
      }
      user_has_any_role: {
        Args: { required_roles: UserRole[] }
        Returns: boolean
      }
      user_is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
    }
  }
}

// AIDEV-NOTE: Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type Tenant = Tables<'tenants'>
export type User = Tables<'users'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type ProductVariation = Tables<'product_variations'>
export type AddonGroup = Tables<'addon_groups'>
export type ProductAddon = Tables<'product_addons'>
export type Customer = Tables<'customers'>
export type CustomerAddress = Tables<'customer_addresses'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type BusinessHours = Tables<'business_hours'>
export type PaymentMethod = Tables<'payment_methods'>

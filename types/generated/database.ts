// Auto-generated Supabase types
// This file was auto-generated from Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      addon_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          max_selections: number
          metadata: Json | null
          min_selections: number
          name: string
          product_id: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          max_selections?: number
          metadata?: Json | null
          min_selections?: number
          name: string
          product_id: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          max_selections?: number
          metadata?: Json | null
          min_selections?: number
          name?: string
          product_id?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'addon_groups_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'addon_groups_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          request_id: string | null
          tenant_id: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          request_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          request_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      bd_ativo: {
        Row: {
          created_at: string
          id: number
          number: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          number?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          number?: number | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          closes_at: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          metadata: Json | null
          opens_at: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closes_at: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          metadata?: Json | null
          opens_at: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closes_at?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          metadata?: Json | null
          opens_at?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_hours_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          metadata: Json | null
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json | null
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json | null
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      customer_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          customer_id: string
          id: string
          is_active: boolean
          is_default: boolean
          label: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          neighborhood: string
          number: string
          reference: string | null
          state: string
          street: string
          tenant_id: string
          updated_at: string
          zip: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          neighborhood: string
          number: string
          reference?: string | null
          state: string
          street: string
          tenant_id: string
          updated_at?: string
          zip: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          neighborhood?: string
          number?: string
          reference?: string | null
          state?: string
          street?: string
          tenant_id?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customer_addresses_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'customer_addresses_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      customers: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          last_order_at: string | null
          metadata: Json | null
          name: string
          notes: string | null
          phone: string
          tenant_id: string
          total_orders: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          last_order_at?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          phone: string
          tenant_id: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          last_order_at?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string
          tenant_id?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customers_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      order_items: {
        Row: {
          addons: Json | null
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variation_id: string | null
          variation_name: string | null
        }
        Insert: {
          addons?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Update: {
          addons?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_variation_id_fkey'
            columns: ['variation_id']
            isOneToOne: false
            referencedRelation: 'product_variations'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivering_at: string | null
          delivery_address: Json | null
          delivery_fee: number
          delivery_type: Database['public']['Enums']['delivery_type']
          discount: number
          estimated_delivery_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: number
          payment_method: Database['public']['Enums']['payment_method_type']
          preparing_at: string | null
          ready_at: string | null
          status: Database['public']['Enums']['order_status']
          subtotal: number
          tenant_id: string
          total: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivering_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
          delivery_type?: Database['public']['Enums']['delivery_type']
          discount?: number
          estimated_delivery_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: number
          payment_method: Database['public']['Enums']['payment_method_type']
          preparing_at?: string | null
          ready_at?: string | null
          status?: Database['public']['Enums']['order_status']
          subtotal?: number
          tenant_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivering_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
          delivery_type?: Database['public']['Enums']['delivery_type']
          discount?: number
          estimated_delivery_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: number
          payment_method?: Database['public']['Enums']['payment_method_type']
          preparing_at?: string | null
          ready_at?: string | null
          status?: Database['public']['Enums']['order_status']
          subtotal?: number
          tenant_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      payment_methods: {
        Row: {
          accepts_change: boolean
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          tenant_id: string
          type: Database['public']['Enums']['payment_method_type']
          updated_at: string
        }
        Insert: {
          accepts_change?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          tenant_id: string
          type: Database['public']['Enums']['payment_method_type']
          updated_at?: string
        }
        Update: {
          accepts_change?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          tenant_id?: string
          type?: Database['public']['Enums']['payment_method_type']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_methods_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      product_addons: {
        Row: {
          addon_group_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_default: boolean
          metadata: Json | null
          name: string
          price: number
          sort_order: number
          stock_quantity: number | null
          tenant_id: string
          track_stock: boolean
          updated_at: string
        }
        Insert: {
          addon_group_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_default?: boolean
          metadata?: Json | null
          name: string
          price?: number
          sort_order?: number
          stock_quantity?: number | null
          tenant_id: string
          track_stock?: boolean
          updated_at?: string
        }
        Update: {
          addon_group_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_default?: boolean
          metadata?: Json | null
          name?: string
          price?: number
          sort_order?: number
          stock_quantity?: number | null
          tenant_id?: string
          track_stock?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_addons_addon_group_id_fkey'
            columns: ['addon_group_id']
            isOneToOne: false
            referencedRelation: 'addon_groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_addons_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      product_variations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          price: number
          product_id: string
          promotional_price: number | null
          sort_order: number
          stock_quantity: number | null
          tenant_id: string
          track_stock: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          price?: number
          product_id: string
          promotional_price?: number | null
          sort_order?: number
          stock_quantity?: number | null
          tenant_id: string
          track_stock?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          price?: number
          product_id?: string
          promotional_price?: number | null
          sort_order?: number
          stock_quantity?: number | null
          tenant_id?: string
          track_stock?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_variations_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_variations_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          available_days: number[] | null
          available_from: string | null
          available_until: string | null
          category_id: string
          created_at: string
          description: string | null
          has_addons: boolean
          has_variations: boolean
          id: string
          image_url: string | null
          is_active: boolean
          is_available: boolean
          is_featured: boolean
          metadata: Json | null
          name: string
          price: number
          promotional_price: number | null
          sort_order: number
          stock_quantity: number | null
          tenant_id: string
          track_stock: boolean
          updated_at: string
        }
        Insert: {
          available_days?: number[] | null
          available_from?: string | null
          available_until?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          has_addons?: boolean
          has_variations?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json | null
          name: string
          price?: number
          promotional_price?: number | null
          sort_order?: number
          stock_quantity?: number | null
          tenant_id: string
          track_stock?: boolean
          updated_at?: string
        }
        Update: {
          available_days?: number[] | null
          available_from?: string | null
          available_until?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          has_addons?: boolean
          has_variations?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json | null
          name?: string
          price?: number
          promotional_price?: number | null
          sort_order?: number
          stock_quantity?: number | null
          tenant_id?: string
          track_stock?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      tenants: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          banner_url: string | null
          created_at: string
          delivery_fee: number | null
          delivery_radius_km: number | null
          description: string | null
          email: string | null
          estimated_delivery_time: number | null
          id: string
          is_active: boolean
          is_open: boolean
          logo_url: string | null
          metadata: Json | null
          min_order_value: number | null
          name: string
          phone: string | null
          primary_color: string | null
          slug: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          banner_url?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_radius_km?: number | null
          description?: string | null
          email?: string | null
          estimated_delivery_time?: number | null
          id?: string
          is_active?: boolean
          is_open?: boolean
          logo_url?: string | null
          metadata?: Json | null
          min_order_value?: number | null
          name: string
          phone?: string | null
          primary_color?: string | null
          slug: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          banner_url?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_radius_km?: number | null
          description?: string | null
          email?: string | null
          estimated_delivery_time?: number | null
          id?: string
          is_active?: boolean
          is_open?: boolean
          logo_url?: string | null
          metadata?: Json | null
          min_order_value?: number | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          slug?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          metadata?: Json | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: { Args: Record<string, never>; Returns: string }
      is_tenant_open: { Args: { p_tenant_id: string }; Returns: boolean }
      show_limit: { Args: Record<string, never>; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
      user_has_any_role: {
        Args: { required_roles: Database['public']['Enums']['user_role'][] }
        Returns: boolean
      }
      user_has_role: {
        Args: { required_role: Database['public']['Enums']['user_role'] }
        Returns: boolean
      }
      user_is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      delivery_type: 'delivery' | 'pickup' | 'dine_in'
      order_status:
        | 'pending'
        | 'confirmed'
        | 'preparing'
        | 'ready'
        | 'delivering'
        | 'delivered'
        | 'cancelled'
      payment_method_type: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'voucher'
      user_role: 'owner' | 'admin' | 'manager' | 'staff'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      delivery_type: ['delivery', 'pickup', 'dine_in'],
      order_status: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'delivering',
        'delivered',
        'cancelled',
      ],
      payment_method_type: ['credit_card', 'debit_card', 'pix', 'cash', 'voucher'],
      user_role: ['owner', 'admin', 'manager', 'staff'],
    },
  },
} as const

// TASK-024: AI Menu Service for fetching categories and products
// AIDEV-NOTE: Service for AI tools to query menu data from Supabase

import { createClient } from "@/lib/supabase/server"
import type { Category, Product, ProductWithRelations } from "@/types/database"

// AIDEV-NOTE: Category with product count for menu display
export interface CategoryWithCount extends Category {
  productCount: number
}

// AIDEV-NOTE: Product formatted for AI display
export interface AIProductDisplay {
  id: string
  name: string
  description: string | null
  price: number
  priceFormatted: string
  categoryId: string | null
  categoryName: string | null
  isAvailable: boolean
  imageUrl: string | null
  variations: Array<{
    id: string
    name: string
    priceModifier: number
  }>
  addons: Array<{
    id: string
    name: string
    price: number
    maxQuantity: number
  }>
}

class AIMenuService {
  // AIDEV-NOTE: Format price for display in Brazilian Real
  formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // AIDEV-NOTE: Get all active categories for a tenant
  async getActiveCategories(tenantId: string): Promise<CategoryWithCount[]> {
    try {
      const supabase = await createClient()

      const { data: categories, error } = await supabase
        .from("categories")
        .select(`
          *,
          products:products(count)
        `)
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error) {
        console.error("[AIMenuService] Error fetching categories:", error)
        return []
      }

      return (categories || []).map((cat) => ({
        ...cat,
        productCount: (cat.products as unknown as { count: number }[])?.[0]?.count || 0,
      }))
    } catch (error) {
      console.error("[AIMenuService] Exception fetching categories:", error)
      return []
    }
  }

  // AIDEV-NOTE: Get products by category (or all if no category specified)
  async getProductsByCategory(
    tenantId: string,
    categoryId?: string
  ): Promise<AIProductDisplay[]> {
    try {
      const supabase = await createClient()

      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name),
          variations:product_variations(id, name, price_modifier, is_active),
          addons:product_addons(id, name, price, max_quantity, is_active)
        `)
        .eq("tenant_id", tenantId)
        .eq("is_available", true)
        .order("sort_order", { ascending: true })

      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      const { data: products, error } = await query

      if (error) {
        console.error("[AIMenuService] Error fetching products:", error)
        return []
      }

      return (products || []).map((product) => this.formatProductForAI(product as ProductWithRelations))
    } catch (error) {
      console.error("[AIMenuService] Exception fetching products:", error)
      return []
    }
  }

  // AIDEV-NOTE: Get product by ID with full details
  async getProductById(
    tenantId: string,
    productId: string
  ): Promise<AIProductDisplay | null> {
    try {
      const supabase = await createClient()

      const { data: product, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name),
          variations:product_variations(id, name, price_modifier, is_active),
          addons:product_addons(id, name, price, max_quantity, is_active)
        `)
        .eq("id", productId)
        .eq("tenant_id", tenantId)
        .single()

      if (error || !product) {
        console.error("[AIMenuService] Error fetching product:", error)
        return null
      }

      return this.formatProductForAI(product as ProductWithRelations)
    } catch (error) {
      console.error("[AIMenuService] Exception fetching product:", error)
      return null
    }
  }

  // AIDEV-NOTE: Search products by name or description
  async searchProducts(
    tenantId: string,
    query: string
  ): Promise<AIProductDisplay[]> {
    try {
      const supabase = await createClient()

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name),
          variations:product_variations(id, name, price_modifier, is_active),
          addons:product_addons(id, name, price, max_quantity, is_active)
        `)
        .eq("tenant_id", tenantId)
        .eq("is_available", true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("name", { ascending: true })
        .limit(20)

      if (error) {
        console.error("[AIMenuService] Error searching products:", error)
        return []
      }

      return (products || []).map((product) => this.formatProductForAI(product as ProductWithRelations))
    } catch (error) {
      console.error("[AIMenuService] Exception searching products:", error)
      return []
    }
  }

  // AIDEV-NOTE: Format product for AI display
  private formatProductForAI(product: ProductWithRelations): AIProductDisplay {
    const category = product.category as { id: string; name: string } | null
    const variations = (product.variations || []) as Array<{
      id: string
      name: string
      price_modifier: number
      is_active: boolean
    }>
    const addons = (product.addons || []) as Array<{
      id: string
      name: string
      price: number
      max_quantity: number
      is_active: boolean
    }>

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      priceFormatted: this.formatPrice(product.price),
      imageUrl: product.image_url,
      categoryId: product.category_id,
      categoryName: category?.name ?? null,
      isAvailable: product.is_available,
      variations: variations
        .filter((v) => v.is_active)
        .map((v) => ({
          id: v.id,
          name: v.name,
          priceModifier: v.price_modifier,
        })),
      addons: addons
        .filter((a) => a.is_active)
        .map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          maxQuantity: a.max_quantity,
        })),
    }
  }
}

// AIDEV-NOTE: Singleton instance
export const aiMenuService = new AIMenuService()

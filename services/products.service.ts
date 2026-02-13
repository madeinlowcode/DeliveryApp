// TASK-065: Products service with CRUD operations
// AIDEV-NOTE: Service layer for products - handles all Supabase interactions including variations and addons

import { createClient } from "@/lib/supabase/client"
import type {
  Product,
  ProductVariation,
  ProductAddon,
  ProductWithRelations,
  InsertTables,
  UpdateTables,
} from "@/types/database"

export type ProductInsert = InsertTables<"products">
export type ProductUpdate = UpdateTables<"products">
export type VariationInsert = InsertTables<"product_variations">
export type VariationUpdate = UpdateTables<"product_variations">
export type AddonInsert = InsertTables<"product_addons">
export type AddonUpdate = UpdateTables<"product_addons">

// AIDEV-NOTE: Get all products for the current establishment with optional category filter
export async function getProducts(
  establishmentId: string,
  options?: {
    categoryId?: string
    includeInactive?: boolean
  }
): Promise<Product[]> {
  const supabase = createClient()

  let query = supabase
    .from("products")
    .select("*")
    .eq("tenant_id", establishmentId)
    .order("sort_order", { ascending: true })

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId)
  }

  if (!options?.includeInactive) {
    query = query.eq("is_available", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    throw new Error("Falha ao buscar produtos")
  }

  return data || []
}

// AIDEV-NOTE: Get a single product by ID with variations and addons
export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (productError) {
    if (productError.code === "PGRST116") {
      return null // Not found
    }
    console.error("Error fetching product:", productError)
    throw new Error("Falha ao buscar produto")
  }

  // Fetch variations
  const { data: variations } = await supabase
    .from("product_variations")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true })

  // Fetch addons
  const { data: addons } = await supabase
    .from("product_addons")
    .select("*")
    .eq("product_id", id)
    .order("name", { ascending: true })

  return {
    ...product,
    variations: variations || [],
    addons: addons || [],
  }
}

// AIDEV-NOTE: Create a new product with auto-incrementing sort_order
export async function createProduct(
  product: Omit<ProductInsert, "sort_order">
): Promise<Product> {
  const supabase = createClient()

  // Get the max sort_order in the category
  let query = supabase
    .from("products")
    .select("sort_order")
    .eq("tenant_id", product.tenant_id)

  // Handle null category_id
  if (product.category_id) {
    query = query.eq("category_id", product.category_id)
  } else {
    query = query.is("category_id", null)
  }

  const { data: existingProducts } = await query
    .order("sort_order", { ascending: false })
    .limit(1)

  const maxSortOrder = existingProducts?.[0]?.sort_order ?? -1
  const newSortOrder = maxSortOrder + 1

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      sort_order: newSortOrder,
      is_available: product.is_available ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating product:", error)
    throw new Error("Falha ao criar produto")
  }

  return data
}

// AIDEV-NOTE: Update an existing product
export async function updateProduct(
  id: string,
  updates: ProductUpdate
): Promise<Product> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating product:", error)
    throw new Error("Falha ao atualizar produto")
  }

  return data
}

// AIDEV-NOTE: Delete a product (hard delete)
export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient()

  // First delete variations and addons
  await supabase.from("product_variations").delete().eq("product_id", id)
  await supabase.from("product_addons").delete().eq("product_id", id)

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    throw new Error("Falha ao excluir produto")
  }
}

// AIDEV-NOTE: Toggle product availability
export async function toggleProductAvailability(
  id: string,
  isAvailable: boolean
): Promise<Product> {
  return updateProduct(id, { is_available: isAvailable })
}

// AIDEV-NOTE: Reorder products within a category
export async function reorderProducts(
  establishmentId: string,
  categoryId: string | null,
  productIds: string[]
): Promise<void> {
  const supabase = createClient()

  for (let i = 0; i < productIds.length; i++) {
    const { error } = await supabase
      .from("products")
      .update({ sort_order: i })
      .eq("id", productIds[i])
      .eq("tenant_id", establishmentId)

    if (error) {
      console.error("Error reordering product:", error)
      throw new Error("Falha ao reordenar produtos")
    }
  }
}

// ==================== VARIATIONS ====================

// AIDEV-NOTE: Get variations for a product
export async function getProductVariations(productId: string): Promise<ProductVariation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_variations")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching variations:", error)
    throw new Error("Falha ao buscar variacoes")
  }

  return data || []
}

// AIDEV-NOTE: Create a new variation
export async function createVariation(variation: VariationInsert): Promise<ProductVariation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_variations")
    .insert(variation)
    .select()
    .single()

  if (error) {
    console.error("Error creating variation:", error)
    throw new Error("Falha ao criar variacao")
  }

  return data
}

// AIDEV-NOTE: Update a variation
export async function updateVariation(
  id: string,
  updates: VariationUpdate
): Promise<ProductVariation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_variations")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating variation:", error)
    throw new Error("Falha ao atualizar variacao")
  }

  return data
}

// AIDEV-NOTE: Delete a variation
export async function deleteVariation(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("product_variations")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting variation:", error)
    throw new Error("Falha ao excluir variacao")
  }
}

// AIDEV-NOTE: Batch update variations for a product (create, update, delete in one operation)
export async function syncVariations(
  productId: string,
  variations: Array<{
    id?: string
    name: string
    price_modifier: number
    sort_order: number
    is_active: boolean
  }>
): Promise<void> {
  const supabase = createClient()

  // Get existing variations
  const { data: existing } = await supabase
    .from("product_variations")
    .select("id")
    .eq("product_id", productId)

  const existingIds = new Set(existing?.map((v) => v.id) || [])
  const newIds = new Set(variations.filter((v) => v.id).map((v) => v.id))

  // Delete removed variations
  const toDelete = [...existingIds].filter((id) => !newIds.has(id))
  if (toDelete.length > 0) {
    await supabase.from("product_variations").delete().in("id", toDelete)
  }

  // Update or create variations
  for (const variation of variations) {
    if (variation.id && existingIds.has(variation.id)) {
      // Update existing
      await supabase
        .from("product_variations")
        .update({
          name: variation.name,
          price_modifier: variation.price_modifier,
          sort_order: variation.sort_order,
          is_active: variation.is_active,
        })
        .eq("id", variation.id)
    } else {
      // Create new
      await supabase.from("product_variations").insert({
        product_id: productId,
        name: variation.name,
        price_modifier: variation.price_modifier,
        sort_order: variation.sort_order,
        is_active: variation.is_active,
      })
    }
  }
}

// ==================== ADDONS ====================

// AIDEV-NOTE: Get addons for a product
export async function getProductAddons(productId: string): Promise<ProductAddon[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_addons")
    .select("*")
    .eq("product_id", productId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching addons:", error)
    throw new Error("Falha ao buscar adicionais")
  }

  return data || []
}

// AIDEV-NOTE: Create a new addon
export async function createAddon(addon: AddonInsert): Promise<ProductAddon> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_addons")
    .insert(addon)
    .select()
    .single()

  if (error) {
    console.error("Error creating addon:", error)
    throw new Error("Falha ao criar adicional")
  }

  return data
}

// AIDEV-NOTE: Update an addon
export async function updateAddon(
  id: string,
  updates: AddonUpdate
): Promise<ProductAddon> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("product_addons")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating addon:", error)
    throw new Error("Falha ao atualizar adicional")
  }

  return data
}

// AIDEV-NOTE: Delete an addon
export async function deleteAddon(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("product_addons")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting addon:", error)
    throw new Error("Falha ao excluir adicional")
  }
}

// AIDEV-NOTE: Batch update addons for a product
export async function syncAddons(
  productId: string,
  addons: Array<{
    id?: string
    name: string
    price: number
    max_quantity: number
    is_active: boolean
  }>
): Promise<void> {
  const supabase = createClient()

  // Get existing addons
  const { data: existing } = await supabase
    .from("product_addons")
    .select("id")
    .eq("product_id", productId)

  const existingIds = new Set(existing?.map((a) => a.id) || [])
  const newIds = new Set(addons.filter((a) => a.id).map((a) => a.id))

  // Delete removed addons
  const toDelete = [...existingIds].filter((id) => !newIds.has(id))
  if (toDelete.length > 0) {
    await supabase.from("product_addons").delete().in("id", toDelete)
  }

  // Update or create addons
  for (const addon of addons) {
    if (addon.id && existingIds.has(addon.id)) {
      // Update existing
      await supabase
        .from("product_addons")
        .update({
          name: addon.name,
          price: addon.price,
          max_quantity: addon.max_quantity,
          is_active: addon.is_active,
        })
        .eq("id", addon.id)
    } else {
      // Create new
      await supabase.from("product_addons").insert({
        product_id: productId,
        name: addon.name,
        price: addon.price,
        max_quantity: addon.max_quantity,
        is_active: addon.is_active,
      })
    }
  }
}

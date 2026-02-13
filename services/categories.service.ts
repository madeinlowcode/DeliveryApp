// TASK-057: Categories service with CRUD operations
// AIDEV-NOTE: Service layer for categories - handles all Supabase interactions

import { createClient } from "@/lib/supabase/client"
import type { Category, InsertTables, UpdateTables } from "@/types/database"

export type CategoryInsert = InsertTables<"categories">
export type CategoryUpdate = UpdateTables<"categories">

// AIDEV-NOTE: Get all categories for the current establishment, ordered by sort_order
export async function getCategories(tenantId: string): Promise<Category[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Falha ao buscar categorias")
  }

  return data || []
}

// AIDEV-NOTE: Get a single category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Not found
    }
    console.error("Error fetching category:", error)
    throw new Error("Falha ao buscar categoria")
  }

  return data
}

// AIDEV-NOTE: Create a new category with auto-incrementing sort_order
export async function createCategory(
  category: Omit<CategoryInsert, "sort_order">
): Promise<Category> {
  const supabase = createClient()

  // Get max sort_order to place new category at the end
  const { data: existingCategories } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("tenant_id", category.tenant_id)
    .order("sort_order", { ascending: false })
    .limit(1)

  const maxSortOrder = existingCategories?.[0]?.sort_order ?? -1
  const newSortOrder = maxSortOrder + 1

  const { data, error } = await supabase
    .from("categories")
    .insert({
      ...category,
      sort_order: newSortOrder,
      is_active: category.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    throw new Error("Falha ao criar categoria")
  }

  return data
}

// AIDEV-NOTE: Update an existing category
export async function updateCategory(
  id: string,
  updates: CategoryUpdate
): Promise<Category> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating category:", error)
    throw new Error("Falha ao atualizar categoria")
  }

  return data
}

// AIDEV-NOTE: Delete a category (soft delete by setting is_active to false, or hard delete)
export async function deleteCategory(id: string, hardDelete = false): Promise<void> {
  const supabase = createClient()

  if (hardDelete) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
      throw new Error("Falha ao excluir categoria")
    }
  } else {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      console.error("Error deactivating category:", error)
      throw new Error("Falha ao desativar categoria")
    }
  }
}

// AIDEV-NOTE: Toggle category active status
export async function toggleCategoryActive(
  id: string,
  isActive: boolean
): Promise<Category> {
  return updateCategory(id, { is_active: isActive })
}

// AIDEV-NOTE: Reorder categories by updating their sort_order values
export async function reorderCategories(
  tenantId: string,
  categoryIds: string[]
): Promise<void> {
  const supabase = createClient()

  // Update each category's sort_order based on its position in array
  const updates = categoryIds.map((id, index) => ({
    id,
    sort_order: index,
  }))

  // Use a transaction-like approach with multiple updates
  for (const update of updates) {
    const { error } = await supabase
      .from("categories")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id)
      .eq("tenant_id", tenantId)

    if (error) {
      console.error("Error reordering category:", error)
      throw new Error("Falha ao reordenar categorias")
    }
  }
}


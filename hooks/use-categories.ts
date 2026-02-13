// TASK-059: Categories hook with SWR for data fetching and caching
// AIDEV-NOTE: Custom hook for category CRUD operations with SWR caching

'use client'

import useSWR, { mutate } from 'swr'
import { useState, useCallback } from 'react'
import type { Category } from '@/types/database'
import type { CategoryFormData } from '@/lib/validators/category'
import * as categoriesService from '@/services/categories.service'

interface UseCategoriesOptions {
  tenantId: string
  autoFetch?: boolean
}

interface UseCategoriesReturn {
  // Data
  categories: Category[]
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isReordering: boolean
  // Error state
  error: string | null
  // Actions
  createCategory: (data: CategoryFormData) => Promise<Category | null>
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<Category | null>
  deleteCategory: (id: string, hardDelete?: boolean) => Promise<boolean>
  reorderCategories: (categoryIds: string[]) => Promise<boolean>
  toggleCategoryActive: (id: string, isActive: boolean) => Promise<Category | null>
  // Helpers
  getCategoryById: (id: string) => Category | undefined
  clearError: () => void
  refresh: () => void
}

// AIDEV-NOTE: Fetcher function for SWR
const fetcher = (key: string) => {
  const [tenantId] = key.split(':')
  return categoriesService.getCategories(tenantId)
}

const CATEGORIES_KEY = (tenantId: string) => `categories:${tenantId}`

export function useCategories({
  tenantId,
  autoFetch = true,
}: UseCategoriesOptions): UseCategoriesReturn {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AIDEV-NOTE: SWR hook for categories with auto-fetch disabled when no tenantId
  const {
    data: categories = [],
    isLoading,
    mutate: mutateCategories,
  } = useSWR<Category[]>(
    tenantId && autoFetch ? CATEGORIES_KEY(tenantId) : null,
    () => categoriesService.getCategories(tenantId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  // AIDEV-NOTE: Refresh categories cache
  const refresh = useCallback(() => {
    if (tenantId) {
      mutate(CATEGORIES_KEY(tenantId))
    }
  }, [tenantId])

  // AIDEV-NOTE: Create a new category
  const createCategory = useCallback(
    async (data: CategoryFormData): Promise<Category | null> => {
      if (!tenantId) return null

      setIsCreating(true)
      setError(null)

      try {
        const newCategory = await categoriesService.createCategory({
          ...data,
          tenant_id: tenantId,
          image_url: data.image_url || null,
          description: data.description || null,
        })
        // Update cache
        await mutateCategories((prev: Category[] = []) => [...prev, newCategory], false)
        return newCategory
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar categoria'
        setError(message)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [tenantId, mutateCategories]
  )

  // AIDEV-NOTE: Update an existing category
  const updateCategory = useCallback(
    async (id: string, data: Partial<CategoryFormData>): Promise<Category | null> => {
      setIsUpdating(true)
      setError(null)

      try {
        const updatedCategory = await categoriesService.updateCategory(id, {
          ...data,
          image_url: data.image_url || null,
          description: data.description || null,
        })
        // Update cache
        await mutateCategories(
          (prev: Category[] = []) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)),
          false
        )
        return updatedCategory
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar categoria'
        setError(message)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    [mutateCategories]
  )

  // AIDEV-NOTE: Delete a category
  const deleteCategory = useCallback(
    async (id: string, hardDelete = false): Promise<boolean> => {
      setIsDeleting(true)
      setError(null)

      try {
        await categoriesService.deleteCategory(id, hardDelete)
        // Update cache
        if (hardDelete) {
          await mutateCategories(
            (prev: Category[] = []) => prev.filter((cat) => cat.id !== id),
            false
          )
        } else {
          await mutateCategories(
            (prev: Category[] = []) =>
              prev.map((cat) => (cat.id === id ? { ...cat, is_active: false } : cat)),
            false
          )
        }
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao excluir categoria'
        setError(message)
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [mutateCategories]
  )

  // AIDEV-NOTE: Reorder categories
  const reorderCategories = useCallback(
    async (categoryIds: string[]): Promise<boolean> => {
      if (!tenantId) return false

      setIsReordering(true)
      setError(null)

      // Optimistic update - save previous state for rollback
      const previousCategories = [...categories]
      const reorderedCategories = categoryIds
        .map((id, index) => {
          const cat = categories.find((c) => c.id === id)
          return cat ? { ...cat, sort_order: index } : null
        })
        .filter((cat): cat is Category => Boolean(cat))

      try {
        // Optimistic update
        await mutateCategories(reorderedCategories, false)
        await categoriesService.reorderCategories(tenantId, categoryIds)
        return true
      } catch (err) {
        // Rollback on error
        await mutateCategories(previousCategories, false)
        const message = err instanceof Error ? err.message : 'Erro ao ordenar categorias'
        setError(message)
        return false
      } finally {
        setIsReordering(false)
      }
    },
    [tenantId, categories, mutateCategories]
  )

  // AIDEV-NOTE: Toggle category active state
  const toggleCategoryActive = useCallback(
    async (id: string, isActive: boolean): Promise<Category | null> => {
      setIsUpdating(true)
      setError(null)

      try {
        const updatedCategory = await categoriesService.toggleCategoryActive(id, isActive)
        // Update cache
        await mutateCategories(
          (prev: Category[] = []) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)),
          false
        )
        return updatedCategory
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao alterar status da categoria'
        setError(message)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    [mutateCategories]
  )

  // AIDEV-NOTE: Helper to get category by ID from local state
  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((cat) => cat.id === id)
    },
    [categories]
  )

  // AIDEV-NOTE: Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    categories,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isReordering,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    toggleCategoryActive,
    getCategoryById,
    clearError,
    refresh,
  }
}

// AIDEV-NOTE: Hook for fetching single category by ID
interface UseCategoryOptions {
  categoryId: string | null
  tenantId: string
}

interface UseCategoryReturn {
  category: Category | null
  isLoading: boolean
  error: string | null
}

const CATEGORY_KEY = (categoryId: string) => `category:${categoryId}`

export function useCategory({ categoryId, tenantId }: UseCategoryOptions): UseCategoryReturn {
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AIDEV-NOTE: Use SWR for single category
  const { data, isLoading: swrLoading } = useSWR<Category | null>(
    categoryId ? CATEGORY_KEY(categoryId) : null,
    () => (categoryId ? categoriesService.getCategoryById(categoryId) : null),
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setCategory(data)
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Erro ao buscar categoria')
      },
    }
  )

  return {
    category: data ?? null,
    isLoading: swrLoading,
    error,
  }
}

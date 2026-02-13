// TASK-067: Products hook with SWR for data fetching and caching
// AIDEV-NOTE: Custom hook for product CRUD operations including variations and addons

'use client'

import useSWR, { mutate } from 'swr'
import { useState, useCallback } from 'react'
import type { Product, ProductWithRelations } from '@/types/database'
import type { ProductFormData } from '@/lib/validators/product'
import * as productsService from '@/services/products.service'

interface UseProductsOptions {
  tenantId: string
  categoryId?: string
  includeInactive?: boolean
  autoFetch?: boolean
}

interface UseProductsReturn {
  // Data
  products: Product[]
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  // Error state
  error: string | null
  // Actions
  createProduct: (data: ProductFormData) => Promise<Product | null>
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<boolean>
  toggleAvailability: (id: string, isAvailable: boolean) => Promise<Product | null>
  // Helpers
  getProductById: (id: string) => Product | undefined
  clearError: () => void
  refresh: () => void
}

// AIDEV-NOTE: Generate cache key for products based on filters
const PRODUCTS_KEY = (tenantId: string, categoryId?: string, includeInactive?: boolean) =>
  `products:${tenantId}:${categoryId ?? 'all'}:${includeInactive ?? true}`

export function useProducts({
  tenantId,
  categoryId,
  includeInactive = true,
  autoFetch = true,
}: UseProductsOptions): UseProductsReturn {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AIDEV-NOTE: SWR hook for products with auto-fetch disabled when no tenantId
  const {
    data: products = [],
    isLoading,
    mutate: mutateProducts,
  } = useSWR<Product[]>(
    tenantId && autoFetch ? PRODUCTS_KEY(tenantId, categoryId, includeInactive) : null,
    () => productsService.getProducts(tenantId, { categoryId, includeInactive }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  // AIDEV-NOTE: Refresh products cache
  const refresh = useCallback(() => {
    if (tenantId) {
      mutate(PRODUCTS_KEY(tenantId, categoryId, includeInactive))
    }
  }, [tenantId, categoryId, includeInactive])

  // AIDEV-NOTE: Create a new product
  const createProduct = useCallback(
    async (data: ProductFormData): Promise<Product | null> => {
      if (!tenantId) return null

      setIsCreating(true)
      setError(null)

      try {
        const newProduct = await productsService.createProduct({
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          category_id: data.category_id || null,
          is_available: data.is_available,
          tenant_id: tenantId,
        })

        // Sync variations if provided
        if (data.variations && data.variations.length > 0) {
          await productsService.syncVariations(
            newProduct.id,
            data.variations.map((v, i) => ({
              ...v,
              sort_order: i,
            }))
          )
        }

        // Sync addons if provided
        if (data.addons && data.addons.length > 0) {
          await productsService.syncAddons(newProduct.id, data.addons)
        }

        // Update cache
        await mutateProducts((prev: Product[] = []) => [...prev, newProduct], false)
        return newProduct
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar produto'
        setError(message)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [tenantId, mutateProducts]
  )

  // AIDEV-NOTE: Update an existing product
  const updateProduct = useCallback(
    async (id: string, data: Partial<ProductFormData>): Promise<Product | null> => {
      setIsUpdating(true)
      setError(null)

      try {
        // Update main product data
        const updateData: productsService.ProductUpdate = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.description !== undefined) updateData.description = data.description || null
        if (data.price !== undefined) updateData.price = data.price
        if (data.image_url !== undefined) updateData.image_url = data.image_url || null
        if (data.category_id !== undefined) updateData.category_id = data.category_id || null
        if (data.is_available !== undefined) updateData.is_available = data.is_available

        const updatedProduct = await productsService.updateProduct(id, updateData)

        // Sync variations if provided
        if (data.variations !== undefined) {
          await productsService.syncVariations(
            id,
            data.variations.map((v, i) => ({
              ...v,
              sort_order: i,
            }))
          )
        }

        // Sync addons if provided
        if (data.addons !== undefined) {
          await productsService.syncAddons(id, data.addons)
        }

        // Update cache
        await mutateProducts(
          (prev: Product[] = []) => prev.map((prod) => (prod.id === id ? updatedProduct : prod)),
          false
        )
        return updatedProduct
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar produto'
        setError(message)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    [mutateProducts]
  )

  // AIDEV-NOTE: Delete a product
  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      setIsDeleting(true)
      setError(null)

      try {
        await productsService.deleteProduct(id)
        // Update cache
        await mutateProducts((prev: Product[] = []) => prev.filter((prod) => prod.id !== id), false)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao excluir produto'
        setError(message)
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [mutateProducts]
  )

  // AIDEV-NOTE: Toggle product availability
  const toggleAvailability = useCallback(
    async (id: string, isAvailable: boolean): Promise<Product | null> => {
      setIsUpdating(true)
      setError(null)

      // Optimistic update
      const previousProducts = [...products]

      try {
        const updatedProduct = await productsService.toggleProductAvailability(id, isAvailable)
        // Update cache
        await mutateProducts(
          (prev: Product[] = []) =>
            prev.map((prod) => (prod.id === id ? { ...prod, is_available: isAvailable } : prod)),
          false
        )
        return updatedProduct
      } catch (err) {
        // Rollback on error
        await mutateProducts(previousProducts, false)
        const message = err instanceof Error ? err.message : 'Erro ao alterar disponibilidade'
        setError(message)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    [products, mutateProducts]
  )

  // AIDEV-NOTE: Helper to get product by ID from local state
  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return products.find((prod) => prod.id === id)
    },
    [products]
  )

  // AIDEV-NOTE: Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    products,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    getProductById,
    clearError,
    refresh,
  }
}

// AIDEV-NOTE: Hook for single product with relations (useful for edit pages)
interface UseProductOptions {
  productId: string | null
}

interface UseProductReturn {
  product: ProductWithRelations | null
  isLoading: boolean
  error: string | null
}

const PRODUCT_KEY = (productId: string) => `product:${productId}`

export function useProduct({ productId }: UseProductOptions): UseProductReturn {
  // AIDEV-NOTE: Use SWR for single product
  const {
    data: product,
    isLoading,
    error,
  } = useSWR<ProductWithRelations | null>(
    productId ? PRODUCT_KEY(productId) : null,
    () => (productId ? productsService.getProductById(productId) : null),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    product: product ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Erro ao buscar produto') : null,
  }
}

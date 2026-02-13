// TASK-058/081: Category validators for forms and API routes
// AIDEV-NOTE: Zod schemas for category validation

import { z } from "zod"

// AIDEV-NOTE: Base schema for category form (used by react-hook-form)
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome e obrigatorio")
    .max(100, "Nome deve ter no maximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descricao deve ter no maximo 500 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  image_url: z
    .string()
    .url("URL da imagem invalida")
    .optional()
    .nullable()
    .or(z.literal("")),
  is_active: z.boolean(),
})

// AIDEV-NOTE: Type for form data (used with react-hook-form)
// Using z.input for form defaults compatibility
export type CategoryFormData = z.input<typeof categoryFormSchema>

// AIDEV-NOTE: Schema for creating a new category (API)
export const createCategorySchema = categoryFormSchema.extend({
  tenant_id: z.string().uuid("ID do tenant inválido"),
  sort_order: z
    .number()
    .int("Ordem deve ser um numero inteiro")
    .min(0, "Ordem deve ser positiva")
    .optional()
    .default(0),
})

// AIDEV-NOTE: Schema for updating an existing category
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no maximo 100 caracteres")
    .optional(),
  description: z
    .string()
    .max(500, "Descricao deve ter no maximo 500 caracteres")
    .optional()
    .nullable(),
  sort_order: z
    .number()
    .int("Ordem deve ser um numero inteiro")
    .min(0, "Ordem deve ser positiva")
    .optional(),
})

// AIDEV-NOTE: Schema for category ID parameter
export const categoryIdSchema = z.object({
  id: z.string().uuid("ID da categoria invalido"),
})

// AIDEV-NOTE: Schema for reordering categories
export const reorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid("ID da categoria invalido"),
      sort_order: z.number().int().min(0),
    })
  ),
})

// AIDEV-NOTE: Export types inferred from schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryIdInput = z.infer<typeof categoryIdSchema>
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>

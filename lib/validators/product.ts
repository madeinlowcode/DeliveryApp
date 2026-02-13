// TASK-066/083: Product validators for forms and API routes
// AIDEV-NOTE: Zod schemas for product validation including variations and addons

import { z } from "zod"

// AIDEV-NOTE: Schema for product variations (sizes, flavors)
export const variationSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new items
  name: z
    .string()
    .min(1, "Nome da variacao e obrigatorio")
    .max(100, "Nome deve ter no maximo 100 caracteres"),
  price_modifier: z.number(), // Can be negative for discounts or positive for upgrades
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
})

export type VariationFormData = z.input<typeof variationSchema>

// AIDEV-NOTE: Schema for product addons (extras, complements)
export const addonSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new items
  name: z
    .string()
    .min(1, "Nome do adicional e obrigatorio")
    .max(100, "Nome deve ter no maximo 100 caracteres"),
  price: z
    .number()
    .min(0, "Preco deve ser zero ou positivo")
    .max(99999.99, "Preco maximo excedido"),
  max_quantity: z
    .number()
    .int()
    .min(1, "Quantidade maxima deve ser pelo menos 1")
    .max(99, "Quantidade maxima deve ser no maximo 99"),
  is_active: z.boolean(),
})

export type AddonFormData = z.input<typeof addonSchema>

// AIDEV-NOTE: Base schema for product form (used by react-hook-form)
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome e obrigatorio")
    .max(200, "Nome deve ter no maximo 200 caracteres"),
  description: z
    .string()
    .max(1000, "Descricao deve ter no maximo 1000 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  price: z
    .number({ error: "Preco deve ser um numero" })
    .positive("Preco deve ser positivo")
    .max(99999.99, "Preco maximo excedido"),
  image_url: z
    .string()
    .url("URL da imagem invalida")
    .optional()
    .nullable()
    .or(z.literal("")),
  category_id: z
    .string()
    .uuid("Categoria invalida")
    .optional()
    .nullable()
    .or(z.literal("")),
  is_available: z.boolean(),
  variations: z.array(variationSchema),
  addons: z.array(addonSchema),
})

// AIDEV-NOTE: Using z.input for form data to be compatible with react-hook-form defaults
export type ProductFormData = z.input<typeof productFormSchema>

// AIDEV-NOTE: Schema for creating a new product (API)
export const createProductSchema = productFormSchema.omit({ variations: true, addons: true }).extend({
  tenant_id: z.string().uuid("ID do tenant inválido"),
  sort_order: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
})

// AIDEV-NOTE: Schema for updating an existing product
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome deve ter no maximo 200 caracteres")
    .optional(),
  description: z
    .string()
    .max(1000, "Descricao deve ter no maximo 1000 caracteres")
    .optional()
    .nullable(),
  price: z
    .number()
    .positive("Preco deve ser positivo")
    .max(99999.99, "Preco maximo excedido")
    .optional(),
  image_url: z
    .string()
    .url("URL da imagem invalida")
    .optional()
    .nullable(),
  category_id: z
    .string()
    .uuid("ID da categoria invalido")
    .optional()
    .nullable(),
  is_available: z.boolean().optional(),
})

// AIDEV-NOTE: Schema for product ID parameter
export const productIdSchema = z.object({
  id: z.string().uuid("ID do produto invalido"),
})

// AIDEV-NOTE: Schema for product query parameters
export const productQuerySchema = z.object({
  category_id: z.string().uuid().optional(),
  is_available: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().max(100).optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .optional(),
})

// AIDEV-NOTE: Export types inferred from schemas
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>

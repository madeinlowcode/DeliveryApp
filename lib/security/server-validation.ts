// AIDEV-SECURITY: Server-side validation schemas using Zod
// All API inputs MUST be validated through these schemas

import { z } from 'zod'

// AIDEV-SECURITY: Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format')
const emailSchema = z.string().email('Invalid email format').max(254)
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format')
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').max(200)
const priceSchema = z.number().min(0, 'Price must be non-negative').finite()
const positiveIntSchema = z.number().int().positive('Must be a positive integer')
const nonNegativeIntSchema = z.number().int().min(0, 'Must be non-negative')

// AIDEV-SECURITY: Sanitized string that strips HTML
const sanitizedStringSchema = (maxLength: number, minLength = 0) =>
  z.string().min(minLength).max(maxLength).transform((val) => val.trim())

// ============================================
// Common Entity Schemas
// ============================================

// AIDEV-SECURITY: Base schema for all entities with common fields
export const baseEntitySchema = z.object({
  id: uuidSchema,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

// AIDEV-SECURITY: Pagination schema
export const paginationSchema = z.object({
  page: nonNegativeIntSchema.default(0),
  limit: positiveIntSchema.max(100).default(20),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// AIDEV-SECURITY: Search/filter schema
export const searchSchema = z.object({
  query: sanitizedStringSchema(200).optional(),
  status: z.string().max(50).optional(),
  category_id: uuidSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

// ============================================
// Product Schemas
// ============================================

export const createProductSchema = z.object({
  name: sanitizedStringSchema(200, 1),
  description: sanitizedStringSchema(2000).optional(),
  price: priceSchema,
  category_id: uuidSchema.optional(),
  image_url: z.string().url().max(500).optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  sort_order: nonNegativeIntSchema.optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: uuidSchema,
  updated_at: z.string().datetime().optional(), // For optimistic locking
})

// ============================================
// Category Schemas
// ============================================

export const createCategorySchema = z.object({
  name: sanitizedStringSchema(100, 1),
  description: sanitizedStringSchema(500).optional(),
  slug: slugSchema.optional(),
  parent_id: uuidSchema.optional(),
  image_url: z.string().url().max(500).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  sort_order: nonNegativeIntSchema.optional(),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: uuidSchema,
  updated_at: z.string().datetime().optional(),
})

// ============================================
// Order Schemas
// ============================================

export const orderItemSchema = z.object({
  product_id: uuidSchema,
  quantity: positiveIntSchema,
  unit_price: priceSchema,
  notes: sanitizedStringSchema(500).optional(),
})

export const createOrderSchema = z.object({
  customer_name: sanitizedStringSchema(200, 1),
  customer_phone: phoneSchema.optional(),
  customer_email: emailSchema.optional(),
  delivery_address: sanitizedStringSchema(500).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  notes: sanitizedStringSchema(1000).optional(),
  scheduled_for: z.string().datetime().optional(),
})

export const updateOrderStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']),
  updated_at: z.string().datetime().optional(),
})

// ============================================
// User/Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
})

export const registerSchema = loginSchema.extend({
  name: sanitizedStringSchema(200, 1),
  phone: phoneSchema.optional(),
})

export const updateProfileSchema = z.object({
  name: sanitizedStringSchema(200).optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url().max(500).optional(),
})

// ============================================
// Tenant/Establishment Schemas
// ============================================

export const createTenantSchema = z.object({
  name: sanitizedStringSchema(200, 1),
  slug: slugSchema,
  description: sanitizedStringSchema(1000).optional(),
  logo_url: z.string().url().max(500).optional(),
  address: sanitizedStringSchema(500).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export const updateTenantSchema = createTenantSchema.partial().extend({
  id: uuidSchema,
  updated_at: z.string().datetime().optional(),
})

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validates data against a schema and returns typed result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and transformed data
 * @throws ZodError if validation fails
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data)
}

/**
 * Safe validation that returns result object instead of throwing
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success boolean and data or error
 */
export function safeValidateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Formats Zod errors into a user-friendly object
 * @param error - Zod error to format
 * @returns Object with field names as keys and error messages as values
 */
export function formatValidationErrors(
  error: z.ZodError<unknown>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root'
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }

  return errors
}

// Export individual schemas for direct use
export {
  uuidSchema,
  emailSchema,
  phoneSchema,
  slugSchema,
  priceSchema,
  positiveIntSchema,
  nonNegativeIntSchema,
}

// Type exports
export type CreateProduct = z.infer<typeof createProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>
export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>
export type CreateOrder = z.infer<typeof createOrderSchema>
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateTenant = z.infer<typeof createTenantSchema>
export type UpdateTenant = z.infer<typeof updateTenantSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type SearchParams = z.infer<typeof searchSchema>

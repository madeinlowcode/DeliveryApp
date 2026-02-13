// TASK-081: Order validators for API routes
// AIDEV-NOTE: Zod schemas for order validation in API endpoints

import { z } from "zod"

// AIDEV-NOTE: Valid order statuses matching database enum
export const orderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
])

// AIDEV-NOTE: Schema for updating order status
export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  notes: z
    .string()
    .max(500, "Notas devem ter no maximo 500 caracteres")
    .optional()
    .nullable(),
})

// AIDEV-NOTE: Schema for order ID parameter
export const orderIdSchema = z.object({
  id: z.string().uuid("ID do pedido invalido"),
})

// AIDEV-NOTE: Schema for order query parameters
export const orderQuerySchema = z.object({
  status: orderStatusEnum.optional(),
  date_from: z
    .string()
    .datetime("Data inicial invalida")
    .optional(),
  date_to: z
    .string()
    .datetime("Data final invalida")
    .optional(),
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

// AIDEV-NOTE: Schema for creating a new order (used by customer chat)
export const createOrderSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Nome do cliente deve ter pelo menos 2 caracteres")
    .max(100, "Nome do cliente deve ter no maximo 100 caracteres"),
  customer_phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Telefone invalido")
    .optional()
    .nullable(),
  customer_address: z
    .string()
    .max(500, "Endereco deve ter no maximo 500 caracteres")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(500, "Notas devem ter no maximo 500 caracteres")
    .optional()
    .nullable(),
  items: z
    .array(
      z.object({
        product_name: z.string().min(1).max(200),
        quantity: z.number().int().min(1).max(99),
        unit_price: z.number().positive().max(99999.99),
        notes: z.string().max(200).optional().nullable(),
      })
    )
    .min(1, "Pedido deve ter pelo menos um item"),
  tenant_id: z.string().uuid("ID do tenant inválido"),
})

// AIDEV-NOTE: Export types inferred from schemas
export type OrderStatus = z.infer<typeof orderStatusEnum>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
export type OrderQueryInput = z.infer<typeof orderQuerySchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>

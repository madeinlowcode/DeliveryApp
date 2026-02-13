// TASK-075: Settings validators for settings service
// AIDEV-NOTE: Zod schemas for establishment settings validation

import { z } from "zod"

// AIDEV-NOTE: Business hours for a single day
const businessHourSchema = z.object({
  open: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horario de abertura invalido (HH:MM)"),
  close: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horario de fechamento invalido (HH:MM)"),
  is_open: z.boolean(),
})

// AIDEV-NOTE: Payment method configuration
const paymentMethodSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  enabled: z.boolean(),
  instructions: z.string().max(500).optional().nullable(),
})

// AIDEV-NOTE: Schema for general establishment settings
export const generalSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no maximo 100 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(50, "Slug deve ter no maximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  address: z
    .string()
    .max(500, "Endereco deve ter no maximo 500 caracteres")
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Telefone invalido")
    .optional()
    .nullable(),
  email: z
    .string()
    .email("Email invalido")
    .optional()
    .nullable(),
  is_active: z.boolean().optional(),
})

// AIDEV-NOTE: Schema for logo upload
export const logoUploadSchema = z.object({
  logo_url: z
    .string()
    .url("URL do logo invalida")
    .optional()
    .nullable(),
})

// AIDEV-NOTE: Schema for business hours settings
export const businessHoursSchema = z.object({
  monday: businessHourSchema,
  tuesday: businessHourSchema,
  wednesday: businessHourSchema,
  thursday: businessHourSchema,
  friday: businessHourSchema,
  saturday: businessHourSchema,
  sunday: businessHourSchema,
})

// AIDEV-NOTE: Schema for payment methods settings
export const paymentMethodsSchema = z.object({
  payment_methods: z.array(paymentMethodSchema),
})

// AIDEV-NOTE: Default payment methods for new establishments
export const defaultPaymentMethods: z.infer<typeof paymentMethodsSchema>["payment_methods"] = [
  { id: "pix", name: "PIX", enabled: true, instructions: null },
  { id: "credit_card", name: "Cartao de Credito", enabled: true, instructions: null },
  { id: "debit_card", name: "Cartao de Debito", enabled: true, instructions: null },
  { id: "cash", name: "Dinheiro", enabled: true, instructions: "Troco para quanto?" },
]

// AIDEV-NOTE: Default business hours for new establishments
export const defaultBusinessHours: z.infer<typeof businessHoursSchema> = {
  monday: { open: "08:00", close: "22:00", is_open: true },
  tuesday: { open: "08:00", close: "22:00", is_open: true },
  wednesday: { open: "08:00", close: "22:00", is_open: true },
  thursday: { open: "08:00", close: "22:00", is_open: true },
  friday: { open: "08:00", close: "23:00", is_open: true },
  saturday: { open: "08:00", close: "23:00", is_open: true },
  sunday: { open: "10:00", close: "20:00", is_open: true },
}

// AIDEV-NOTE: Combined settings schema
export const establishmentSettingsSchema = z.object({
  general: generalSettingsSchema,
  logo: logoUploadSchema.optional(),
  business_hours: businessHoursSchema.optional(),
  payment_methods: paymentMethodsSchema.optional(),
})

// AIDEV-NOTE: Export types inferred from schemas
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>
export type LogoUploadInput = z.infer<typeof logoUploadSchema>
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>
export type PaymentMethodsInput = z.infer<typeof paymentMethodsSchema>
export type BusinessHour = z.infer<typeof businessHourSchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type EstablishmentSettingsInput = z.infer<typeof establishmentSettingsSchema>

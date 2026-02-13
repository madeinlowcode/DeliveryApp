// TASK-086: Upload validators for signed URL API
// AIDEV-NOTE: Zod schemas for file upload validation

import { z } from "zod"

// AIDEV-NOTE: Allowed file types for uploads
export const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const

// AIDEV-NOTE: Schema for signed URL request
export const signedUrlRequestSchema = z.object({
  filename: z
    .string()
    .min(1, "Nome do arquivo obrigatorio")
    .max(255, "Nome do arquivo muito longo")
    .regex(
      /^[\w\-. ]+\.(jpg|jpeg|png|gif|webp)$/i,
      "Nome do arquivo invalido. Use apenas letras, numeros, hifens e pontos"
    ),
  contentType: z.enum(allowedImageTypes, {
    message: "Tipo de arquivo nao permitido. Use JPEG, PNG, GIF ou WebP",
  }),
  folder: z
    .enum(["logos", "products", "categories"], {
      message: "Pasta invalida",
    })
    .optional()
    .default("products"),
})

// AIDEV-NOTE: Schema for upload completion callback
export const uploadCompleteSchema = z.object({
  path: z.string().min(1, "Caminho do arquivo obrigatorio"),
  url: z.string().url("URL invalida"),
})

// AIDEV-NOTE: Maximum file sizes in bytes
export const maxFileSizes = {
  logos: 2 * 1024 * 1024, // 2MB
  products: 5 * 1024 * 1024, // 5MB
  categories: 2 * 1024 * 1024, // 2MB
} as const

// AIDEV-NOTE: Export types inferred from schemas
export type SignedUrlRequestInput = z.infer<typeof signedUrlRequestSchema>
export type UploadCompleteInput = z.infer<typeof uploadCompleteSchema>
export type AllowedImageType = (typeof allowedImageTypes)[number]
export type UploadFolder = SignedUrlRequestInput["folder"]

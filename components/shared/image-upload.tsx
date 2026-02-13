// TASK-072: Image upload component with Supabase Storage
// AIDEV-NOTE: Handles image upload, preview, and deletion for products and categories

"use client"

import * as React from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // AIDEV-NOTE: Handle file selection and upload to Supabase Storage
  const handleUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens sao permitidas")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("Imagem deve ter no maximo 5MB")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(data.path)

      onChange(urlData.publicUrl)
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
    }
  }

  // AIDEV-NOTE: Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  // AIDEV-NOTE: Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  // AIDEV-NOTE: Remove current image
  const handleRemove = () => {
    onChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Image Preview or Upload Zone */}
      {value ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute -right-2 -top-2"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-colors",
            dragOver && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && !isUploading && "hover:border-primary hover:bg-muted/50"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="mt-2 text-sm text-muted-foreground">
                Enviando...
              </span>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-3">
                {dragOver ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <span className="mt-2 text-sm text-muted-foreground">
                Clique ou arraste uma imagem
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG ate 5MB
              </span>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* URL Input (alternative) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">ou cole uma URL:</span>
        <Input
          type="url"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isUploading}
          className="h-8 flex-1 text-xs"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

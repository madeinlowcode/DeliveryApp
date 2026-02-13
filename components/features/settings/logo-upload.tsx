"use client"

// TASK-077: Logo upload component
// AIDEV-NOTE: Component for uploading and managing establishment logo

import * as React from "react"
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface LogoUploadProps {
  currentLogoUrl?: string | null
  onUpload: (file: File) => Promise<string>
  onRemove: () => Promise<void>
  isLoading?: boolean
  maxSizeInMB?: number
}

// AIDEV-NOTE: Component for managing establishment logo with drag-and-drop support
export function LogoUpload({
  currentLogoUrl,
  onUpload,
  onRemove,
  isLoading = false,
  maxSizeInMB = 2,
}: LogoUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  // AIDEV-NOTE: Validate file type and size
  function validateFile(file: File): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return "Formato nao suportado. Use JPEG, PNG, GIF ou WebP."
    }

    if (file.size > maxSizeInBytes) {
      return `Arquivo muito grande. Maximo: ${maxSizeInMB}MB.`
    }

    return null
  }

  async function handleFileSelect(file: File) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  async function handleRemove() {
    setIsRemoving(true)
    try {
      await onRemove()
      setPreviewUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover logo")
    } finally {
      setIsRemoving(false)
    }
  }

  const displayUrl = previewUrl || currentLogoUrl
  const isProcessing = isLoading || isUploading || isRemoving

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo do Estabelecimento</CardTitle>
        <CardDescription>
          Imagem que aparecera no cardapio e pedidos. Recomendado: 512x512px
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview/Upload Area */}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
              isDragging && "border-primary bg-primary/5",
              !isDragging && "border-muted-foreground/25",
              isProcessing && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {displayUrl ? (
              <div className="relative">
                <img
                  src={displayUrl}
                  alt="Logo do estabelecimento"
                  className="h-32 w-32 rounded-lg object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-12 w-12" />
                <p className="text-sm">Arraste uma imagem ou clique para selecionar</p>
                <p className="text-xs">JPEG, PNG, GIF ou WebP (max {maxSizeInMB}MB)</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {displayUrl ? "Trocar Logo" : "Enviar Logo"}
            </Button>

            {displayUrl && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isProcessing}
                  >
                    {isRemoving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remover
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover Logo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acao nao pode ser desfeita. O logo sera removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemove}>
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

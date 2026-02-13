// TASK-061: Category form component
// AIDEV-NOTE: Form for creating and editing categories with react-hook-form and zod validation

"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ImageUpload } from "@/components/shared/image-upload"
import { categoryFormSchema, type CategoryFormData } from "@/lib/validators/category"
import type { Category } from "@/types/database"

interface CategoryFormProps {
  category?: Category | null
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      image_url: category?.image_url ?? "",
      is_active: category?.is_active ?? true,
    },
  })

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data)
    } catch {
      // Error handled by parent
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descricao</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descricao opcional da categoria..."
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Uma breve descricao que aparecera para os clientes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  folder="categories"
                />
              </FormControl>
              <FormDescription>
                Imagem representativa da categoria (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Categoria ativa</FormLabel>
                <FormDescription>
                  Categorias inativas nao aparecem no cardapio para clientes.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Salvar alteracoes" : "Criar categoria"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

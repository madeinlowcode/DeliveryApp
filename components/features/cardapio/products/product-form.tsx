// TASK-071: Product form component
// AIDEV-NOTE: Complete form for creating and editing products with variations and addons

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/shared/image-upload"
import { VariationManager } from "./variation-manager"
import { AddonManager } from "./addon-manager"
import { productFormSchema, type ProductFormData } from "@/lib/validators/product"
import type { ProductWithRelations, Category } from "@/types/database"

interface ProductFormProps {
  product?: ProductWithRelations | null
  categories: Category[]
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

export function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      image_url: product?.image_url ?? "",
      category_id: product?.category_id ?? "",
      is_available: product?.is_available ?? true,
      variations: product?.variations?.map((v) => ({
        id: v.id,
        name: v.name,
        price_modifier: v.price_modifier,
        sort_order: v.sort_order,
        is_active: v.is_active,
      })) ?? [],
      addons: product?.addons?.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
        max_quantity: a.max_quantity,
        is_active: a.is_active,
      })) ?? [],
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data)
    } catch {
      // Error handled by parent
    }
  }

  // AIDEV-NOTE: Filter only active categories for selection
  const activeCategories = categories.filter((c) => c.is_active)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-8", className)}
      >
        {/* Basic Info Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Informacoes basicas</h3>
            <p className="text-sm text-muted-foreground">
              Dados principais do produto
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Pizza Margherita, X-Burger..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preco *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        className="pl-10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  A categoria onde o produto sera exibido.
                </FormDescription>
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
                    placeholder="Descricao do produto, ingredientes, etc..."
                    rows={3}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Detalhes que ajudam o cliente a entender o produto.
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
                    folder="products"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Availability */}
          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Disponivel para venda</FormLabel>
                  <FormDescription>
                    Produtos indisponiveis nao aparecem para os clientes.
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
        </div>

        <Separator />

        {/* Variations Section */}
        <FormField
          control={form.control}
          name="variations"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <VariationManager
                  variations={field.value || []}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Addons Section */}
        <FormField
          control={form.control}
          name="addons"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AddonManager
                  addons={field.value || []}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

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
            {product ? "Salvar alteracoes" : "Criar produto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

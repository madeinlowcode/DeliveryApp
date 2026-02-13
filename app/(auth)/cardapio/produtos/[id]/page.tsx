// TASK-074: Product edit/create page
// AIDEV-NOTE: Page for creating new or editing existing products with variations and addons

"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductForm } from "@/components/features/cardapio/products"
import { useProduct, useProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import type { ProductFormData } from "@/lib/validators/product"

// AIDEV-NOTE: Temporary tenant ID for development
const TEMP_TENANT_ID = "00000000-0000-0000-0000-000000000001"

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const isNew = productId === "novo"

  // AIDEV-NOTE: Fetch existing product if editing
  const { product, isLoading: isLoadingProduct, error: fetchError } = useProduct(
    isNew ? null : productId
  )

  // AIDEV-NOTE: Fetch categories for dropdown
  const { categories, isLoading: isLoadingCategories } = useCategories({
    tenantId: TEMP_TENANT_ID,
    autoFetch: true,
  })

  // AIDEV-NOTE: Products hook for create/update operations
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts({
    tenantId: TEMP_TENANT_ID,
    autoFetch: false,
  })

  const isSubmitting = isCreating || isUpdating
  const isLoading = isLoadingProduct || isLoadingCategories

  // AIDEV-NOTE: Handle form submission
  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (isNew) {
        const newProduct = await createProduct(data)
        if (newProduct) {
          toast.success("Produto criado com sucesso")
          router.push("/cardapio/produtos")
        }
      } else {
        const updated = await updateProduct(productId, data)
        if (updated) {
          toast.success("Produto atualizado com sucesso")
          router.push("/cardapio/produtos")
        }
      }
    } catch (err) {
      toast.error(isNew ? "Erro ao criar produto" : "Erro ao atualizar produto")
    }
  }

  // AIDEV-NOTE: Handle cancel
  const handleCancel = () => {
    router.push("/cardapio/produtos")
  }

  // Loading state
  if (isLoading && !isNew) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-4 w-48" />
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <Skeleton className="mb-6 h-8 w-32" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  // Error state
  if (!isNew && fetchError) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/cardapio/produtos">Produtos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Erro</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <h2 className="text-lg font-medium text-destructive">
                Erro ao carregar produto
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{fetchError}</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/cardapio/produtos">Voltar para produtos</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Not found state
  if (!isNew && !product && !isLoadingProduct) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/cardapio/produtos">Produtos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Nao encontrado</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg border border-muted p-6 text-center">
              <h2 className="text-lg font-medium">Produto nao encontrado</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                O produto que voce esta procurando nao existe ou foi removido.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/cardapio/produtos">Voltar para produtos</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cardapio/produtos">Produtos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isNew ? "Novo produto" : product?.name || "Editar"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/cardapio/produtos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para produtos
            </Link>
          </Button>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isNew ? "Novo produto" : "Editar produto"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm
                product={product}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

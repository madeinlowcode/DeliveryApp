// TASK-064: Category edit/create page
// AIDEV-NOTE: Page for creating new or editing existing categories

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
import { CategoryForm } from "@/components/features/cardapio/categories"
import { useCategory, useCategories } from "@/hooks/use-categories"
import type { CategoryFormData } from "@/lib/validators/category"

// AIDEV-NOTE: Temporary establishment ID for development
const TEMP_TENANT_ID = "00000000-0000-0000-0000-000000000001"

export default function CategoryEditPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  const isNew = categoryId === "novo"

  // AIDEV-NOTE: Fetch existing category if editing
  const { category, isLoading: isLoadingCategory, error: fetchError } = useCategory({
    categoryId: isNew ? null : categoryId,
    tenantId: TEMP_TENANT_ID,
  })

  // AIDEV-NOTE: Categories hook for create/update operations
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories({
    tenantId: TEMP_TENANT_ID,
    autoFetch: false,
  })

  const isSubmitting = isCreating || isUpdating

  // AIDEV-NOTE: Handle form submission
  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (isNew) {
        const newCategory = await createCategory(data)
        if (newCategory) {
          toast.success("Categoria criada com sucesso")
          router.push("/cardapio/categorias")
        }
      } else {
        const updated = await updateCategory(categoryId, data)
        if (updated) {
          toast.success("Categoria atualizada com sucesso")
          router.push("/cardapio/categorias")
        }
      }
    } catch (err) {
      toast.error(isNew ? "Erro ao criar categoria" : "Erro ao atualizar categoria")
    }
  }

  // AIDEV-NOTE: Handle cancel
  const handleCancel = () => {
    router.push("/cardapio/categorias")
  }

  // Loading state for edit mode
  if (!isNew && isLoadingCategory) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-4 w-48" />
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-16 w-full" />
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
                <BreadcrumbLink href="/cardapio/categorias">Categorias</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Erro</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <h2 className="text-lg font-medium text-destructive">
                Erro ao carregar categoria
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{fetchError}</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/cardapio/categorias">Voltar para categorias</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Not found state
  if (!isNew && !category && !isLoadingCategory) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/cardapio/categorias">Categorias</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Nao encontrada</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-muted p-6 text-center">
              <h2 className="text-lg font-medium">Categoria nao encontrada</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A categoria que voce esta procurando nao existe ou foi removida.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/cardapio/categorias">Voltar para categorias</Link>
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
              <BreadcrumbLink href="/cardapio/categorias">Categorias</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isNew ? "Nova categoria" : category?.name || "Editar"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          {/* Back Link */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/cardapio/categorias">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para categorias
            </Link>
          </Button>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isNew ? "Nova categoria" : "Editar categoria"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm
                category={category}
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

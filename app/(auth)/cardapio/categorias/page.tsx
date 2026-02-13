// TASK-063: Categories listing page
// AIDEV-NOTE: Page for viewing and managing menu categories with drag-to-reorder

"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
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
import { CategoryList } from "@/components/features/cardapio/categories"
import { useCategories } from "@/hooks/use-categories"

// AIDEV-NOTE: Temporary tenant ID for development
// In production, this should come from the user session/context
const TEMP_TENANT_ID = "00000000-0000-0000-0000-000000000001"

export default function CategoriasPage() {
  const {
    categories,
    isLoading,
    error,
    reorderCategories,
    deleteCategory,
    toggleCategoryActive,
  } = useCategories({
    tenantId: TEMP_TENANT_ID,
    autoFetch: true,
  })

  // AIDEV-NOTE: Handle reorder with toast feedback
  const handleReorder = async (categoryIds: string[]) => {
    const success = await reorderCategories(categoryIds)
    if (success) {
      toast.success("Ordem atualizada com sucesso")
    } else {
      toast.error("Erro ao reordenar categorias")
    }
  }

  // AIDEV-NOTE: Handle delete with toast feedback
  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id, true)
    if (success) {
      toast.success("Categoria excluida com sucesso")
    } else {
      toast.error("Erro ao excluir categoria")
    }
  }

  // AIDEV-NOTE: Handle toggle active with toast feedback
  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await toggleCategoryActive(id, isActive)
    if (result) {
      toast.success(isActive ? "Categoria ativada" : "Categoria desativada")
    } else {
      toast.error("Erro ao alterar status da categoria")
    }
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
              <BreadcrumbLink href="/cardapio/categorias">Cardapio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categorias</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Categorias</h1>
              <p className="text-muted-foreground">
                Organize o cardapio do seu estabelecimento
              </p>
            </div>
            <Button asChild>
              <Link href="/cardapio/categorias/novo">
                <Plus className="mr-2 h-4 w-4" />
                Nova categoria
              </Link>
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Category List */}
          <CategoryList
            categories={categories}
            isLoading={isLoading}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />

          {/* Help Text */}
          {!isLoading && categories.length > 0 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Arraste as categorias para reordenar. A ordem aqui sera refletida no cardapio.
            </p>
          )}
        </div>
      </main>
    </>
  )
}

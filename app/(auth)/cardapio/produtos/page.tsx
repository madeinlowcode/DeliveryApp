// TASK-073: Products listing page
// AIDEV-NOTE: Page for viewing and managing menu products with filtering

"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, Package } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/features/cardapio/products"
import { useProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"

// AIDEV-NOTE: Temporary tenant ID for development
const TEMP_TENANT_ID = "00000000-0000-0000-0000-000000000001"

export default function ProdutosPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  // AIDEV-NOTE: Fetch categories for filter dropdown
  const { categories, isLoading: isLoadingCategories } = useCategories({
    tenantId: TEMP_TENANT_ID,
    autoFetch: true,
  })

  // AIDEV-NOTE: Fetch products
  const {
    products,
    isLoading: isLoadingProducts,
    error,
    deleteProduct,
    toggleAvailability,
    fetchProducts,
  } = useProducts({
    tenantId: TEMP_TENANT_ID,
    includeInactive: true,
    autoFetch: true,
  })

  // AIDEV-NOTE: Filter products by search and category
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Filter by search query
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by category
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "uncategorized" && !product.category_id) ||
        product.category_id === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  // AIDEV-NOTE: Get category by ID for product card
  const getCategoryById = (categoryId: string | null) => {
    if (!categoryId) return null
    return categories.find((c) => c.id === categoryId) || null
  }

  // AIDEV-NOTE: Handle delete with toast feedback
  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id)
    if (success) {
      toast.success("Produto excluido com sucesso")
    } else {
      toast.error("Erro ao excluir produto")
    }
  }

  // AIDEV-NOTE: Handle toggle availability with toast feedback
  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    const result = await toggleAvailability(id, isAvailable)
    if (result) {
      toast.success(isAvailable ? "Produto disponibilizado" : "Produto indisponibilizado")
    } else {
      toast.error("Erro ao alterar disponibilidade")
    }
  }

  const isLoading = isLoadingProducts || isLoadingCategories

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
              <BreadcrumbLink href="/cardapio/produtos">Cardapio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Produtos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Produtos</h1>
              <p className="text-muted-foreground">
                Gerencie os produtos do seu cardapio
              </p>
            </div>
            <Button asChild>
              <Link href="/cardapio/produtos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo produto
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="uncategorized">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Products List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 rounded-xl border p-4">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">
                {searchQuery || selectedCategory !== "all"
                  ? "Nenhum produto encontrado"
                  : "Nenhum produto"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Adicione seu primeiro produto ao cardapio."}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button className="mt-6" asChild>
                  <Link href="/cardapio/produtos/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar produto
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={getCategoryById(product.category_id)}
                  onDelete={handleDelete}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredProducts.length > 0 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          )}
        </div>
      </main>
    </>
  )
}

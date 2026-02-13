// TASK-068: Product card component for listing
// AIDEV-NOTE: Displays a single product with edit/delete/toggle actions

"use client"

import * as React from "react"
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  Package,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import type { Product, Category } from "@/types/database"

interface ProductCardProps {
  product: Product
  category?: Category | null
  onDelete?: (id: string) => Promise<void>
  onToggleAvailability?: (id: string, isAvailable: boolean) => Promise<void>
}

// AIDEV-NOTE: Format price to BRL currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export function ProductCard({
  product,
  category,
  onDelete,
  onToggleAvailability,
}: ProductCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isToggling, setIsToggling] = React.useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(product.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleAvailability = async () => {
    if (!onToggleAvailability) return
    setIsToggling(true)
    try {
      await onToggleAvailability(product.id, !product.is_available)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card
      className={cn(
        "transition-all",
        !product.is_available && "opacity-60"
      )}
    >
      <CardContent className="flex gap-4 p-4">
        {/* Image */}
        {/* TASK-070: Added loading="lazy" for performance */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={`Imagem do produto ${product.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">{product.name}</h3>
                {!product.is_available && (
                  <Badge variant="secondary" className="shrink-0">
                    Indisponivel
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3">
                <span className="font-semibold text-primary">
                  {formatPrice(product.price)}
                </span>
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex flex-col items-end gap-2">
              {/* Availability Toggle */}
              {/* TASK-053: Added proper accessibility for availability toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground" id={`availability-label-${product.id}`}>
                  {product.is_available ? "Disponivel" : "Indisponivel"}
                </span>
                <Switch
                  checked={product.is_available}
                  onCheckedChange={handleToggleAvailability}
                  disabled={isToggling}
                  aria-labelledby={`availability-label-${product.id}`}
                  aria-label={product.is_available ? `Marcar ${product.name} como indisponivel` : `Marcar ${product.name} como disponivel`}
                />
              </div>

              {/* Action Buttons */}
              {/* TASK-055: Added keyboard navigation support */}
              <div className="flex items-center gap-1">
                {/* Edit */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  asChild
                  aria-label={`Editar ${product.name}`}
                >
                  <Link href={`/cardapio/produtos/${product.id}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>

                {/* Delete */}
                {/* TASK-055: Added proper accessibility for delete action */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o produto &quot;{product.name}&quot;?
                        Esta acao nao pode ser desfeita e todas as variacoes e
                        adicionais serao excluidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        {isDeleting ? "Excluindo..." : "Excluir"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

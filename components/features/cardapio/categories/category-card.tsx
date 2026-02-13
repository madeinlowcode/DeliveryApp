// TASK-060: Category card component for listing
// AIDEV-NOTE: Displays a single category with edit/delete actions and drag handle

"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import type { Category } from "@/types/database"

interface CategoryCardProps {
  category: Category
  onDelete?: (id: string) => Promise<void>
  onToggleActive?: (id: string, isActive: boolean) => Promise<void>
  isDragging?: boolean
}

export function CategoryCard({
  category,
  onDelete,
  onToggleActive,
  isDragging = false,
}: CategoryCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isToggling, setIsToggling] = React.useState(false)

  // AIDEV-NOTE: dnd-kit sortable hook for drag-to-reorder
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(category.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async () => {
    if (!onToggleActive) return
    setIsToggling(true)
    try {
      await onToggleActive(category.id, !category.is_active)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-shadow",
        (isDragging || isSortableDragging) && "shadow-lg opacity-90",
        !category.is_active && "opacity-60"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        {/* TASK-053: Added aria-label for accessibility */}
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="Arrastar categoria {category.name}"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Image */}
        {/* TASK-070: Added loading="lazy" for performance */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={`Imagem da categoria ${category.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{category.name}</h3>
            {!category.is_active && (
              <Badge variant="secondary" className="shrink-0">
                Inativa
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="truncate text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Toggle Active */}
          {/* TASK-053: Added aria-label and proper accessibility attributes */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleActive}
            disabled={isToggling}
            aria-label={category.is_active ? `Desativar ${category.name}` : `Ativar ${category.name}`}
            aria-pressed={category.is_active}
          >
            {category.is_active ? (
              <Eye className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>

          {/* Edit */}
          {/* TASK-054: Added keyboard navigation support */}
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={`Editar ${category.name}`}
          >
            <Link href={`/cardapio/categorias/${category.id}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          {/* Delete */}
          {/* TASK-054: Added proper accessibility for delete action */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                aria-label={`Excluir ${category.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a categoria &quot;{category.name}&quot;?
                  Esta acao nao pode ser desfeita. Os produtos desta categoria
                  ficarao sem categoria.
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
      </CardContent>
    </Card>
  )
}

'use client'

// AIDEV-NOTE: Confirmation dialog component
// Used for destructive actions like deletes to prevent accidental data loss

import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog should close */
  onClose: () => void
  /** Callback when action is confirmed */
  onConfirm: () => void | Promise<void>
  /** Dialog title */
  title?: string
  /** Dialog description/message */
  description?: string
  /** Text for confirm button */
  confirmText?: string
  /** Text for cancel button */
  cancelText?: string
  /** Variant affects styling */
  variant?: 'default' | 'destructive'
  /** Whether the action is in progress */
  isLoading?: boolean
  /** Custom icon */
  icon?: React.ReactNode
  /** Additional content below the description */
  children?: React.ReactNode
}

/**
 * Confirmation dialog component
 * Requires explicit confirmation before proceeding with potentially destructive actions
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar acao',
  description = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false,
  icon,
  children,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)
  const dialogRef = React.useRef<HTMLDivElement>(null)

  // Handle confirm action
  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      // Error handling should be done by the parent
      console.error('Confirm action failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isLoading && !isConfirming) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose, isLoading, isConfirming])

  // Focus trap and body scroll lock
  React.useEffect(() => {
    if (open) {
      const previousActiveElement = document.activeElement as HTMLElement
      dialogRef.current?.focus()

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = ''
        previousActiveElement?.focus()
      }
    }
  }, [open])

  if (!open) return null

  const loading = isLoading || isConfirming

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          tabIndex={-1}
          className={cn(
            'relative w-full max-w-md bg-background rounded-lg shadow-xl',
            'border p-6 focus:outline-none',
            'animate-in fade-in-0 zoom-in-95 duration-200'
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4',
              variant === 'destructive'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            )}
          >
            {icon || (variant === 'destructive' && <AlertTriangle className="h-6 w-6" />)}
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-center mb-2"
          >
            {title}
          </h2>

          {/* Description */}
          <p
            id="confirm-dialog-description"
            className="text-sm text-muted-foreground text-center mb-4"
          >
            {description}
          </p>

          {/* Additional content */}
          {children && <div className="mb-4">{children}</div>}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage confirm dialog state
 */
export function useConfirmDialog<T = void>() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [data, setData] = React.useState<T | null>(null)
  const resolveRef = React.useRef<((confirmed: boolean) => void) | null>(null)

  const open = React.useCallback((dialogData?: T): Promise<boolean> => {
    setData(dialogData ?? null)
    setIsOpen(true)

    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
    setData(null)
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const confirm = React.useCallback(() => {
    setIsOpen(false)
    setData(null)
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  return {
    isOpen,
    data,
    open,
    close,
    confirm,
  }
}

/**
 * Delete confirmation dialog preset
 */
export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  itemName,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  itemName?: string
  isLoading?: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Excluir registro"
      description={
        itemName
          ? `Tem certeza que deseja excluir "${itemName}"? Esta acao nao pode ser desfeita.`
          : 'Tem certeza que deseja excluir este registro? Esta acao nao pode ser desfeita.'
      }
      confirmText="Excluir"
      cancelText="Cancelar"
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

/**
 * Unsaved changes confirmation dialog preset
 */
export function UnsavedChangesDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Alteracoes nao salvas"
      description="Voce tem alteracoes que nao foram salvas. Deseja sair sem salvar?"
      confirmText="Sair sem salvar"
      cancelText="Continuar editando"
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

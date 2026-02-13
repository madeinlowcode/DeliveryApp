'use client'

// AIDEV-NOTE: Audit Log Viewer component
// Displays comprehensive audit trail with filtering and pagination

import * as React from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  User,
  Calendar,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Types
type AuditAction = 'create' | 'read' | 'update' | 'delete'

interface AuditLogEntry {
  id: string
  tenant_id: string
  user_id?: string
  user_email?: string
  user_name?: string
  entity_type: string
  entity_id: string
  action: AuditAction
  old_data?: Record<string, unknown> | null
  new_data?: Record<string, unknown> | null
  changes?: Record<string, { old: unknown; new: unknown }> | null
  ip_address?: string
  user_agent?: string
  request_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

interface AuditLogViewerProps {
  /** Audit log entries to display */
  logs: AuditLogEntry[]
  /** Whether data is loading */
  isLoading?: boolean
  /** Total count for pagination */
  totalCount?: number
  /** Current page (0-indexed) */
  page?: number
  /** Page size */
  pageSize?: number
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when filter changes */
  onFilterChange?: (filters: AuditFilters) => void
  /** Callback to refresh data */
  onRefresh?: () => void
  /** Available entity types for filtering */
  entityTypes?: string[]
  /** Current filters */
  filters?: AuditFilters
  /** CSS class name */
  className?: string
}

interface AuditFilters {
  entityType?: string
  action?: AuditAction
  startDate?: string
  endDate?: string
}

// Action icons and colors
const actionConfig: Record<
  AuditAction,
  { icon: React.ElementType; color: string; label: string }
> = {
  create: { icon: Plus, color: 'text-green-600 bg-green-100', label: 'Criado' },
  read: { icon: Eye, color: 'text-blue-600 bg-blue-100', label: 'Visualizado' },
  update: { icon: Pencil, color: 'text-amber-600 bg-amber-100', label: 'Atualizado' },
  delete: { icon: Trash2, color: 'text-red-600 bg-red-100', label: 'Excluido' },
}

// Entity type labels (can be extended)
const entityLabels: Record<string, string> = {
  product: 'Produto',
  category: 'Categoria',
  order: 'Pedido',
  user: 'Usuario',
  tenant: 'Estabelecimento',
}

/**
 * Individual audit log entry row
 */
function AuditLogRow({ log }: { log: AuditLogEntry }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { icon: ActionIcon, color, label } = actionConfig[log.action]

  const hasChanges =
    log.changes && Object.keys(log.changes).length > 0

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => hasChanges && setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
          hasChanges && 'cursor-pointer'
        )}
        disabled={!hasChanges}
      >
        {/* Expand indicator */}
        <div className="w-5 h-5 flex items-center justify-center">
          {hasChanges ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
        </div>

        {/* Action icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            color
          )}
        >
          <ActionIcon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{label}</span>
            <span className="text-muted-foreground text-sm">
              {entityLabels[log.entity_type] || log.entity_type}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <User className="h-3 w-3" />
            <span>{log.user_name || log.user_email || 'Sistema'}</span>
            <span>-</span>
            <Calendar className="h-3 w-3" />
            <span
              title={format(new Date(log.created_at), 'PPpp', { locale: ptBR })}
            >
              {formatDistanceToNow(new Date(log.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </div>

        {/* ID badge */}
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
          {log.entity_id.slice(0, 8)}
        </div>
      </button>

      {/* Expanded changes view */}
      {isExpanded && hasChanges && (
        <div className="px-4 py-3 bg-muted/30 border-t">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Alteracoes:
          </h4>
          <div className="space-y-2">
            {Object.entries(log.changes!).map(([field, { old: oldVal, new: newVal }]) => (
              <div
                key={field}
                className="grid grid-cols-3 gap-2 text-sm bg-background rounded p-2"
              >
                <div className="font-medium text-muted-foreground">
                  {field}
                </div>
                <div className="text-red-600 line-through truncate">
                  {formatValue(oldVal)}
                </div>
                <div className="text-green-600 truncate">
                  {formatValue(newVal)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Loading skeleton for audit log rows
 */
function AuditLogSkeleton() {
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b">
      <div className="w-5 h-5" />
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

/**
 * AuditLogViewer component
 * Displays a list of audit log entries with filtering and pagination
 */
export function AuditLogViewer({
  logs,
  isLoading = false,
  totalCount = 0,
  page = 0,
  pageSize = 20,
  onPageChange,
  onFilterChange,
  onRefresh,
  entityTypes = [],
  filters = {},
  className,
}: AuditLogViewerProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Historico de Auditoria</h3>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn('h-4 w-4 mr-1', isLoading && 'animate-spin')}
              />
              Atualizar
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {onFilterChange && (
        <div className="px-4 py-3 border-b bg-muted/30 flex flex-wrap gap-2">
          <select
            className="text-sm border rounded px-2 py-1 bg-background"
            value={filters.entityType || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, entityType: e.target.value || undefined })
            }
          >
            <option value="">Todos os tipos</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {entityLabels[type] || type}
              </option>
            ))}
          </select>

          <select
            className="text-sm border rounded px-2 py-1 bg-background"
            value={filters.action || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                action: (e.target.value as AuditAction) || undefined,
              })
            }
          >
            <option value="">Todas as acoes</option>
            <option value="create">Criacao</option>
            <option value="update">Atualizacao</option>
            <option value="delete">Exclusao</option>
            <option value="read">Visualizacao</option>
          </select>

          <input
            type="date"
            className="text-sm border rounded px-2 py-1 bg-background"
            value={filters.startDate || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, startDate: e.target.value || undefined })
            }
            placeholder="Data inicial"
          />

          <input
            type="date"
            className="text-sm border rounded px-2 py-1 bg-background"
            value={filters.endDate || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, endDate: e.target.value || undefined })
            }
            placeholder="Data final"
          />
        </div>
      )}

      {/* Content */}
      <div className="divide-y">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => <AuditLogSkeleton key={i} />)
        ) : logs.length === 0 ? (
          // Empty state
          <div className="px-4 py-12 text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum registro de auditoria encontrado</p>
          </div>
        ) : (
          // Audit log entries
          logs.map((log) => <AuditLogRow key={log.id} log={log} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Proximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export type { AuditLogEntry, AuditFilters, AuditAction }

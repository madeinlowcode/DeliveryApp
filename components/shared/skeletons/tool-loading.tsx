// TASK-066: Tool loading skeleton component
// AIDEV-NOTE: Loading state for AI tools - visual feedback during processing

'use client'

import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export type ToolType = 'category' | 'product' | 'order' | 'analytics' | 'general'

interface ToolLoadingProps {
  /** Type of tool being loaded */
  type?: ToolType
  /** Custom message to display */
  message?: string
  /** Whether to show spinner animation */
  showSpinner?: boolean
  /** CSS class name */
  className?: string
}

/**
 * ToolLoading component
 * Displays appropriate loading state based on tool type
 */
export function ToolLoading({
  type = 'general',
  message,
  showSpinner = true,
  className,
}: ToolLoadingProps) {
  const defaultMessages: Record<ToolType, string> = {
    category: 'Carregando categorias...',
    product: 'Carregando produtos...',
    order: 'Processando pedido...',
    analytics: 'Gerando analise...',
    general: 'Carregando...',
  }

  const displayMessage = message || defaultMessages[type]

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
        {showSpinner && (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
        <p className="text-sm text-muted-foreground">{displayMessage}</p>
      </CardContent>
    </Card>
  )
}

/**
 * Inline tool loading indicator (smaller, for buttons/inline actions)
 */
interface ToolLoadingInlineProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** CSS class name */
  className?: string
}

export function ToolLoadingInline({
  size = 'sm',
  className,
}: ToolLoadingInlineProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  )
}

/**
 * Skeleton loader for tool results
 */
interface ToolResultSkeletonProps {
  /** Type of result skeleton */
  type?: ToolType
  /** Number of items to show */
  count?: number
}

export function ToolResultSkeleton({
  type = 'general',
  count = 3,
}: ToolResultSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Combined tool loading with progress bar
 */
interface ToolLoadingWithProgressProps {
  /** Progress value (0-100) */
  progress?: number
  /** Type of tool */
  type?: ToolType
  /** Custom message */
  message?: string
}

export function ToolLoadingWithProgress({
  progress,
  type = 'general',
  message,
}: ToolLoadingWithProgressProps) {
  const [currentProgress, setCurrentProgress] = React.useState(0)

  // Animate progress on mount
  React.useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setCurrentProgress(progress)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [progress])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {message || 'Processando...'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        {/* Progress Text */}
        {progress !== undefined && (
          <p className="text-xs text-muted-foreground text-center">
            {currentProgress}%
          </p>
        )}

        {/* Skeleton Results */}
        <ToolResultSkeleton type={type} count={2} />
      </CardContent>
    </Card>
  )
}

import { cn } from '@/lib/utils'

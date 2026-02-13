"use client"

// TASK-031: Tool loading skeleton component
// AIDEV-NOTE: Displays loading state during AI tool execution

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ToolLoadingProps {
  toolName?: string
  message?: string
  variant?: "skeleton" | "spinner" | "dots" | "progress"
  progress?: number // 0-100
  className?: string
}

export function ToolLoading({
  toolName = "Processando",
  message,
  variant = "skeleton",
  progress,
  className,
}: ToolLoadingProps) {
  const [currentProgress, setCurrentProgress] = React.useState(0)

  // Animate progress if not provided
  React.useEffect(() => {
    if (variant === "progress" && progress === undefined) {
      const timer = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 95) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      return () => clearInterval(timer)
    }
  }, [variant, progress])

  const displayProgress = progress ?? currentProgress

  if (variant === "spinner") {
    return <SpinnerLoading toolName={toolName} message={message} className={className} />
  }

  if (variant === "dots") {
    return <DotsLoading toolName={toolName} message={message} className={className} />
  }

  if (variant === "progress") {
    return (
      <ProgressLoading
        toolName={toolName}
        message={message}
        progress={displayProgress}
        className={className}
      />
    )
  }

  return <SkeletonLoading toolName={toolName} className={className} />
}

// AIDEV-NOTE: Skeleton loading variant
function SkeletonLoading({
  toolName,
  className,
}: {
  toolName: string
  className?: string
}) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Spinner loading variant
function SpinnerLoading({
  toolName,
  message,
  className,
}: {
  toolName: string
  message?: string
  className?: string
}) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>

          <div className="text-center">
            <p className="font-medium">{toolName}</p>
            {message && (
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Dots loading variant
function DotsLoading({
  toolName,
  message,
  className,
}: {
  toolName: string
  message?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground py-2", className)}>
      <span>{toolName}</span>
      {message && <span>- {message}</span>}
      <span className="flex gap-1">
        <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
        <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
      </span>
    </div>
  )
}

// AIDEV-NOTE: Progress bar loading variant
function ProgressLoading({
  toolName,
  message,
  progress,
  className,
}: {
  toolName: string
  message?: string
  progress: number
  className?: string
}) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{toolName}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-2" />

          {message && (
            <p className="text-xs text-muted-foreground text-center">{message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Compact inline loading for chat messages
export function ToolLoadingInline({ message = "Processando..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm py-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-muted-foreground">{message}</span>
    </div>
  )
}

// AIDEV-NOTE: Full page loading overlay
export function ToolLoadingOverlay({
  message = "Carregando...",
}: {
  message?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// TASK-042: Typing indicator component
// AIDEV-NOTE: Animated "typing" indicator for chat messages

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  className?: string
  dotClassName?: string
  size?: "sm" | "md" | "lg"
  variant?: "dots" | "wave" | "pulse"
}

// AIDEV-NOTE: Size variants for animation
const sizeClasses = {
  sm: "h-1 w-1",
  md: "h-2 w-2",
  lg: "h-3 w-3",
}

const containerSizes = {
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-3",
}

export function TypingIndicator({
  className,
  dotClassName,
  size = "md",
  variant = "dots",
}: TypingIndicatorProps) {
  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex items-center",
          containerSizes[size],
          className
        )}
        role="status"
        aria-label="Digitando"
      >
        <span
          className={cn(
            "animate-bounce rounded-full bg-current opacity-75",
            sizeClasses[size],
            dotClassName,
            "[animation-delay:-0.3s]"
          )}
        />
        <span
          className={cn(
            "animate-bounce rounded-full bg-current opacity-75",
            sizeClasses[size],
            dotClassName,
            "[animation-delay:-0.15s]"
          )}
        />
        <span
          className={cn(
            "animate-bounce rounded-full bg-current opacity-75",
            sizeClasses[size],
            dotClassName
          )}
        />
      </div>
    )
  }

  if (variant === "wave") {
    return (
      <div
        className={cn(
          "flex items-center",
          containerSizes[size],
          className
        )}
        role="status"
        aria-label="Digitando"
      >
        <span
          className={cn(
            "animate-wave rounded-full bg-current opacity-75",
            sizeClasses[size],
            dotClassName,
            "[animation-delay:-0.4s]"
          )}
          style={{
            animation: "wave 1s ease-in-out infinite",
          }}
        />
        <span
          className={cn(
            "animate-wave rounded-full bg-current opacity-75",
            sizeClasses[size],
            dotClassName,
            "[animation-delay:-0.2s]"
          )}
          style={{
            animation: "wave 1s ease-in-out infinite",
          }}
        />
        <span
          className={cn(
            "animate-wave rounded-full bg-current opacity-75",
            sizeClasses[size],
            dotClassName
          )}
          style={{
            animation: "wave 1s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes wave {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>
    )
  }

  // Pulse variant
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      role="status"
      aria-label="Digitando"
    >
      <span
        className={cn(
          "animate-ping absolute inline-flex rounded-full bg-current opacity-75",
          sizeClasses[size],
          dotClassName
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full bg-current",
          sizeClasses[size],
          dotClassName
        )}
      />
    </div>
  )
}

// AIDEV-NOTE: Inline text variant for use in chat bubbles
interface TypingIndicatorTextProps {
  className?: string
}

export function TypingIndicatorText({
  className,
}: TypingIndicatorTextProps) {
  return (
    <span
      className={cn(
        "text-sm text-muted-foreground italic",
        className
      )}
    >
      Digitando
      <span className="animate-pulse">...</span>
    </span>
  )
}

// AIDEV-NOTE: Full chat bubble with typing indicator
interface TypingIndicatorBubbleProps {
  className?: string
  avatar?: React.ReactNode
}

export function TypingIndicatorBubble({
  className,
  avatar,
}: TypingIndicatorBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        className
      )}
    >
      {avatar && (
        <div className="shrink-0">
          {avatar}
        </div>
      )}
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <TypingIndicator size="sm" />
      </div>
    </div>
  )
}

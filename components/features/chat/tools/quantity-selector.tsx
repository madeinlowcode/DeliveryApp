"use client"

// TASK-023: Quantity selector component with +/- buttons
// AIDEV-NOTE: Allows users to adjust item quantities in cart

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuantitySelectorProps {
  quantity: number
  min?: number
  max?: number
  onIncrease: () => void
  onDecrease: () => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export function QuantitySelector({
  quantity,
  min = 1,
  max = 99,
  onIncrease,
  onDecrease,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Selector de quantidade",
}: QuantitySelectorProps) {
  const canDecrease = quantity > min
  const canIncrease = quantity < max

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-input bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={ariaLabel}
    >
      {/* Decrease button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-l-lg rounded-r-none hover:bg-accent"
        onClick={onDecrease}
        disabled={disabled || !canDecrease}
        aria-label="Diminuir quantidade"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
        </svg>
      </Button>

      {/* Quantity display */}
      <div className="w-12 text-center text-sm font-medium tabular-nums">
        {quantity}
      </div>

      {/* Increase button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-r-lg rounded-l-none hover:bg-accent"
        onClick={onIncrease}
        disabled={disabled || !canIncrease}
        aria-label="Aumentar quantidade"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </Button>
    </div>
  )
}

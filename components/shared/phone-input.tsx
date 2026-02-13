// TASK-039: Phone input with Brazilian phone mask
// AIDEV-NOTE: Formats phone numbers as (XX) XXXXX-XXXX or (XX) XXXX-XXXX

"use client"

import * as React from "react"
import { Phone } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  showIcon?: boolean
}

// AIDEV-NOTE: Format phone number to Brazilian standard
function formatPhone(value: string): string {
  // Remove non-numeric characters
  const numbers = value.replace(/\D/g, "")

  // Limit to 11 digits
  const truncated = numbers.slice(0, 11)

  // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  if (truncated.length === 0) {
    return ""
  } else if (truncated.length <= 2) {
    return `(${truncated}`
  } else if (truncated.length <= 7) {
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`
  } else if (truncated.length <= 11) {
    const seventh = truncated[6]
    // Check if it's a 9-digit number (new format)
    if (truncated.length === 11 && seventh === "9") {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`
    }
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 6)}-${truncated.slice(6)}`
  }

  return truncated
}

// AIDEV-NOTE: Extract raw numbers from formatted phone
export function extractPhoneNumbers(formatted: string): string {
  return formatted.replace(/\D/g, "")
}

// AIDEV-NOTE: Validate Brazilian phone number
export function validatePhone(phone: string): boolean {
  const numbers = extractPhoneNumbers(phone)
  // 10 or 11 digits (landline or mobile)
  return numbers.length === 10 || numbers.length === 11
}

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  showIcon = true,
  className,
  ...props
}: PhoneInputProps) {
  // AIDEV-NOTE: Handle input change with formatting
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    onChange(formatted)
  }

  const isValid = value && validatePhone(value)

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="relative">
        {showIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Phone className="h-4 w-4" />
          </div>
        )}
        <Input
          {...props}
          type="tel"
          value={value}
          onChange={handleChange}
          className={cn(
            showIcon && "pl-10",
            error && "border-destructive focus-visible:ring-destructive",
            isValid && !error && "border-green-500"
          )}
          placeholder="(00) 00000-0000"
          maxLength={15}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

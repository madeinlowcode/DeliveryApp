"use client"

// TASK-029: Business hours message component
// AIDEV-NOTE: Displays whether establishment is open or closed

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { BusinessHours } from "@/types/cart"

// AIDEV-NOTE: Day names in Portuguese
const DAY_NAMES: Record<keyof BusinessHours, string> = {
  sunday: "Domingo",
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
}

// AIDEV-NOTE: Get current day key
function getCurrentDayKey(): keyof BusinessHours {
  const days: (keyof BusinessHours)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]
  return days[new Date().getDay()]
}

// AIDEV-NOTE: Parse time string to minutes
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

// AIDEV-NOTE: Check if establishment is open now
function isOpenNow(businessHours: BusinessHours | undefined): boolean {
  if (!businessHours) return false

  const todayKey = getCurrentDayKey()
  const todayHours = businessHours[todayKey]

  if (!todayHours || todayHours.isClosed) {
    return false
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = parseTime(todayHours.open)
  const closeMinutes = parseTime(todayHours.close)

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

// AIDEV-NOTE: Get next open day
function getNextOpenDay(
  businessHours: BusinessHours | undefined
): {
  day: string
  hours: { open: string; close: string }
} | null {
  if (!businessHours) return null

  const days: (keyof BusinessHours)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]

  const todayIndex = new Date().getDay()
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  // Check if open later today
  const todayKey = days[todayIndex]
  const todayHours = businessHours[todayKey]
  if (todayHours && !todayHours.isClosed) {
    const openMinutes = parseTime(todayHours.open)
    if (currentMinutes < openMinutes) {
      return { day: "hoje", hours: todayHours }
    }
  }

  // Check next days
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (todayIndex + i) % 7
    const nextKey = days[nextIndex]
    const nextHours = businessHours[nextKey]

    if (nextHours && !nextHours.isClosed) {
      return { day: DAY_NAMES[nextKey], hours: nextHours }
    }
  }

  return null
}

interface BusinessHoursMessageProps {
  businessHours?: BusinessHours
  isLoading?: boolean
  variant?: "full" | "compact" | "badge"
  className?: string
}

export function BusinessHoursMessage({
  businessHours,
  isLoading = false,
  variant = "full",
  className,
}: BusinessHoursMessageProps) {
  const open = isOpenNow(businessHours)
  const nextOpen = getNextOpenDay(businessHours)

  if (isLoading) {
    return <BusinessHoursSkeleton variant={variant} className={className} />
  }

  if (variant === "badge") {
    return (
      <Badge variant={open ? "default" : "secondary"} className={cn("", className)}>
        {open ? "Aberto agora" : "Fechado"}
      </Badge>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            open ? "bg-green-500" : "bg-red-500"
          )}
        />
        <span className={open ? "text-green-700" : "text-red-700"}>
          {open ? "Aberto" : "Fechado"}
        </span>
        {!open && nextOpen && (
          <span className="text-muted-foreground">
            • abre {nextOpen.day} as {nextOpen.hours.open}
          </span>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "border-l-4",
        open ? "border-green-500" : "border-red-500",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              open
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            )}
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600 dark:text-green-500"
              >
                <path d="M12 3v12m5 12l7 7 7-7" />
                <path d="M12 3v12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600 dark:text-red-500"
              >
                <path d="M15 9l6-6 6a6 6 0 0-6 6" />
                <path d="M9 15l3 3 3" />
              </svg>
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <p
              className={cn(
                "font-medium",
                open ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              )}
            >
              {open ? "Estamos abertos!" : "Estamos fechados"}
            </p>

            {!open && nextOpen ? (
              <p className="text-sm text-muted-foreground mt-1">
                Abre {nextOpen.day === "hoje" ? "hoje" : `na ${nextOpen.day}`}
                {nextOpen.hours.open}
              </p>
            ) : open && businessHours?.[getCurrentDayKey()] ? (
              <p className="text-sm text-muted-foreground mt-1">
                Fechamos às {businessHours[getCurrentDayKey()]!.close}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Skeleton loaders
function BusinessHoursSkeleton({
  variant,
  className,
}: {
  variant: "full" | "compact" | "badge"
  className?: string
}) {
  if (variant === "badge") {
    return <Skeleton className={cn("h-6 w-24", className)} />
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}

// AIDEV-NOTE: Full business hours display
export function BusinessHoursList({
  businessHours,
  isLoading = false,
  className,
}: {
  businessHours?: BusinessHours
  isLoading?: boolean
  className?: string
}) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (!businessHours) {
    return (
      <p className="text-sm text-muted-foreground">
        Horário de funcionamento não disponível
      </p>
    )
  }

  const todayKey = getCurrentDayKey()

  return (
    <div className={cn("space-y-1", className)}>
      {(
        [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ] as const
      ).map((day) => {
        const hours = businessHours[day]
        if (!hours) return null

        const isToday = day === todayKey

        return (
          <div
            key={day}
            className={cn(
              "flex justify-between text-sm py-1 px-2 rounded",
              isToday && "bg-muted font-medium"
            )}
          >
            <span className={isToday ? "text-primary" : ""}>
              {DAY_NAMES[day]}
            </span>
            <span>
              {hours.isClosed ? (
                <span className="text-muted-foreground">Fechado</span>
              ) : (
                <span>
                  {hours.open} - {hours.close}
                </span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

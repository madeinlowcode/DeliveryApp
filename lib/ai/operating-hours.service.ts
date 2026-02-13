// TASK-028: Operating Hours Service
// AIDEV-NOTE: Service to check if establishment is currently open

import type { BusinessHours, DayHours } from "@/types/cart"

export interface OperatingHoursResult {
  isOpen: boolean
  message: string
  nextOpenTime: string | null
  currentTime: string
}

// AIDEV-NOTE: Default operating hours if none configured
const DEFAULT_HOURS: DayHours = {
  open: "11:00",
  close: "23:00",
  isClosed: false,
}

class OperatingHoursService {
  private dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const

  private dayNamesPt = [
    "Domingo",
    "Segunda",
    "Terca",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sabado",
  ]

  // AIDEV-NOTE: Get operating hours for a specific day
  private getDayHours(
    businessHours: BusinessHours | undefined,
    dayIndex: number
  ): DayHours {
    if (!businessHours) {
      return DEFAULT_HOURS
    }

    const dayName = this.dayNames[dayIndex]
    return businessHours[dayName] || DEFAULT_HOURS
  }

  // AIDEV-NOTE: Check if establishment is currently open
  checkIfOpen(businessHours?: BusinessHours): OperatingHoursResult {
    const now = new Date()
    const currentDay = now.getDay()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

    const todayHours = this.getDayHours(businessHours, currentDay)

    // Check if closed today
    if (todayHours.isClosed) {
      const nextOpen = this.findNextOpenTime(businessHours, currentDay)
      return {
        isOpen: false,
        message: "Estamos fechados hoje.",
        nextOpenTime: nextOpen,
        currentTime: currentTimeStr,
      }
    }

    const isWithinHours = this.isTimeWithinRange(
      currentTimeStr,
      todayHours.open,
      todayHours.close
    )

    if (isWithinHours) {
      return {
        isOpen: true,
        message: `Estamos abertos! Funcionamos ate as ${todayHours.close}.`,
        nextOpenTime: null,
        currentTime: currentTimeStr,
      }
    }

    // Check if before opening time
    if (this.compareTime(currentTimeStr, todayHours.open) < 0) {
      return {
        isOpen: false,
        message: `Ainda nao abrimos. Abrimos as ${todayHours.open}.`,
        nextOpenTime: `Hoje as ${todayHours.open}`,
        currentTime: currentTimeStr,
      }
    }

    // After closing time
    const nextOpen = this.findNextOpenTime(businessHours, currentDay)
    return {
      isOpen: false,
      message: "Estamos fechados no momento.",
      nextOpenTime: nextOpen,
      currentTime: currentTimeStr,
    }
  }

  // AIDEV-NOTE: Check if current time is within operating range
  private isTimeWithinRange(
    current: string,
    open: string,
    close: string
  ): boolean {
    // Handle overnight hours (e.g., 11:00 - 00:00 or 22:00 - 02:00)
    if (this.compareTime(close, open) <= 0) {
      return (
        this.compareTime(current, open) >= 0 ||
        this.compareTime(current, close) < 0
      )
    }
    return (
      this.compareTime(current, open) >= 0 &&
      this.compareTime(current, close) < 0
    )
  }

  // AIDEV-NOTE: Compare two time strings (HH:MM format)
  private compareTime(a: string, b: string): number {
    const [aH, aM] = a.split(":").map(Number)
    const [bH, bM] = b.split(":").map(Number)
    if (aH !== bH) return aH - bH
    return aM - bM
  }

  // AIDEV-NOTE: Find next opening time
  private findNextOpenTime(
    businessHours: BusinessHours | undefined,
    currentDay: number
  ): string | null {
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7
      const dayHours = this.getDayHours(businessHours, checkDay)

      if (!dayHours.isClosed) {
        const dayName = i === 1 ? "Amanha" : this.dayNamesPt[checkDay]
        return `${dayName} as ${dayHours.open}`
      }
    }

    return null
  }

  // AIDEV-NOTE: Format business hours for display
  formatBusinessHours(businessHours?: BusinessHours): string {
    if (!businessHours) {
      return "Segunda a Domingo: 11:00 - 23:00"
    }

    const lines: string[] = []

    for (let i = 0; i < 7; i++) {
      const dayHours = this.getDayHours(businessHours, i)
      const dayName = this.dayNamesPt[i]

      if (dayHours.isClosed) {
        lines.push(`${dayName}: Fechado`)
      } else {
        lines.push(`${dayName}: ${dayHours.open} - ${dayHours.close}`)
      }
    }

    return lines.join("\n")
  }
}

// AIDEV-NOTE: Singleton instance
export const operatingHoursService = new OperatingHoursService()

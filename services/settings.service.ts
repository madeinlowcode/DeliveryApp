// TASK-075: Settings service for establishment configuration
// AIDEV-NOTE: Service layer for establishment settings CRUD operations

import { getClient } from "@/lib/supabase/client"
import type { Establishment } from "@/types/database"
import type {
  GeneralSettingsInput,
  BusinessHoursInput,
  PaymentMethodsInput,
  BusinessHour,
  PaymentMethod,
} from "@/lib/validators/settings"
import {
  defaultBusinessHours,
  defaultPaymentMethods,
} from "@/lib/validators/settings"

// AIDEV-NOTE: Extended establishment type with settings
export interface EstablishmentSettings extends Establishment {
  business_hours?: BusinessHoursInput
  payment_methods?: PaymentMethod[]
}

// AIDEV-NOTE: Settings service for client-side operations
class SettingsService {
  private get supabase() {
    return getClient()
  }

  // AIDEV-NOTE: Fetch establishment settings by ID
  async getSettings(establishmentId: string): Promise<EstablishmentSettings | null> {
    const { data, error } = await this.supabase
      .from("establishments")
      .select("*")
      .eq("id", establishmentId)
      .single()

    if (error) {
      console.error("Error fetching settings:", error)
      return null
    }

    // AIDEV-NOTE: Parse JSON settings from metadata columns if they exist
    // For now, return with defaults since schema may not have these columns yet
    return {
      ...data,
      business_hours: defaultBusinessHours,
      payment_methods: defaultPaymentMethods,
    }
  }

  // AIDEV-NOTE: Update general establishment settings
  async updateGeneralSettings(
    establishmentId: string,
    settings: Partial<GeneralSettingsInput>
  ): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from("establishments")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", establishmentId)
      .select()
      .single()

    if (error) {
      console.error("Error updating general settings:", error)
      throw new Error(`Falha ao atualizar configuracoes: ${error.message}`)
    }

    return data
  }

  // AIDEV-NOTE: Update establishment logo
  async updateLogo(
    establishmentId: string,
    logoUrl: string | null
  ): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from("establishments")
      .update({
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", establishmentId)
      .select()
      .single()

    if (error) {
      console.error("Error updating logo:", error)
      throw new Error(`Falha ao atualizar logo: ${error.message}`)
    }

    return data
  }

  // AIDEV-NOTE: Update business hours
  // AIDEV-TODO: This requires a business_hours column in the database
  async updateBusinessHours(
    establishmentId: string,
    businessHours: BusinessHoursInput
  ): Promise<EstablishmentSettings> {
    // AIDEV-NOTE: For now, store in localStorage until database schema is updated
    // In production, this would update a JSON column or related table
    const storageKey = `business_hours_${establishmentId}`

    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(businessHours))
    }

    const settings = await this.getSettings(establishmentId)
    if (!settings) {
      throw new Error("Estabelecimento nao encontrado")
    }

    return {
      ...settings,
      business_hours: businessHours,
    }
  }

  // AIDEV-NOTE: Get business hours from storage
  getBusinessHours(establishmentId: string): BusinessHoursInput {
    if (typeof window === "undefined") {
      return defaultBusinessHours
    }

    const storageKey = `business_hours_${establishmentId}`
    const stored = localStorage.getItem(storageKey)

    if (stored) {
      try {
        return JSON.parse(stored) as BusinessHoursInput
      } catch {
        return defaultBusinessHours
      }
    }

    return defaultBusinessHours
  }

  // AIDEV-NOTE: Update payment methods
  // AIDEV-TODO: This requires a payment_methods column in the database
  async updatePaymentMethods(
    establishmentId: string,
    paymentMethods: PaymentMethod[]
  ): Promise<EstablishmentSettings> {
    // AIDEV-NOTE: For now, store in localStorage until database schema is updated
    const storageKey = `payment_methods_${establishmentId}`

    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(paymentMethods))
    }

    const settings = await this.getSettings(establishmentId)
    if (!settings) {
      throw new Error("Estabelecimento nao encontrado")
    }

    return {
      ...settings,
      payment_methods: paymentMethods,
    }
  }

  // AIDEV-NOTE: Get payment methods from storage
  getPaymentMethods(establishmentId: string): PaymentMethod[] {
    if (typeof window === "undefined") {
      return defaultPaymentMethods
    }

    const storageKey = `payment_methods_${establishmentId}`
    const stored = localStorage.getItem(storageKey)

    if (stored) {
      try {
        return JSON.parse(stored) as PaymentMethod[]
      } catch {
        return defaultPaymentMethods
      }
    }

    return defaultPaymentMethods
  }

  // AIDEV-NOTE: Check if establishment is currently open based on business hours
  isCurrentlyOpen(businessHours: BusinessHoursInput): boolean {
    const now = new Date()
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const

    const today = days[now.getDay()]
    const todayHours = businessHours[today] as BusinessHour

    if (!todayHours.is_open) {
      return false
    }

    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    return currentTime >= todayHours.open && currentTime <= todayHours.close
  }

  // AIDEV-NOTE: Get enabled payment methods
  getEnabledPaymentMethods(paymentMethods: PaymentMethod[]): PaymentMethod[] {
    return paymentMethods.filter((method) => method.enabled)
  }

  // AIDEV-NOTE: Toggle establishment active status
  async toggleActive(
    establishmentId: string,
    isActive: boolean
  ): Promise<Establishment> {
    const { data, error } = await this.supabase
      .from("establishments")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", establishmentId)
      .select()
      .single()

    if (error) {
      console.error("Error toggling active status:", error)
      throw new Error(`Falha ao alterar status: ${error.message}`)
    }

    return data
  }
}

// AIDEV-NOTE: Export singleton instance
export const settingsService = new SettingsService()

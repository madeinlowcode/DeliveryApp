"use client"

// TASK-037: Customer hook for managing phone and name
// AIDEV-NOTE: Manages customer identification and data

import { useState, useCallback, useEffect } from "react"

// AIDEV-NOTE: Customer data structure
export interface Customer {
  id?: string
  name: string
  phone: string
  address?: string
  createdAt?: Date
  lastOrderAt?: Date
  orderCount?: number
}

interface UseCustomerOptions {
  autoIdentify?: boolean
  onSave?: (customer: Customer) => void
}

interface UseCustomerReturn {
  customer: Customer | null
  isIdentified: boolean
  isLoading: boolean
  isSaving: boolean
  error: Error | null
  identify: (phone: string, name?: string) => Promise<Customer>
  updateCustomer: (updates: Partial<Omit<Customer, "phone">>) => void
  saveCustomer: () => Promise<void>
  clearCustomer: () => void
}

// AIDEV-NOTE: Normalize phone number to digits only
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

// AIDEV-NOTE: Format phone for display
function formatPhone(phone: string): string {
  const digits = normalizePhone(phone)

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }

  return phone
}

// AIDEV-NOTE: Local storage key
const CUSTOMER_STORAGE_KEY = "delivery_customer_data"

// AIDEV-NOTE: Load customer from localStorage
function loadCustomerFromStorage(): Customer | null {
  if (typeof window === "undefined") return null

  try {
    const data = localStorage.getItem(CUSTOMER_STORAGE_KEY)
    if (!data) return null

    const parsed = JSON.parse(data)
    return {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : undefined,
      lastOrderAt: parsed.lastOrderAt ? new Date(parsed.lastOrderAt) : undefined,
    }
  } catch {
    return null
  }
}

// AIDEV-NOTE: Save customer to localStorage
function saveCustomerToStorage(customer: Customer | null): void {
  if (typeof window === "undefined") return

  if (customer) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer))
  } else {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY)
  }
}

export function useCustomer({
  autoIdentify = true,
  onSave,
}: UseCustomerOptions = {}): UseCustomerReturn {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load customer from storage on mount
  useEffect(() => {
    if (autoIdentify) {
      const saved = loadCustomerFromStorage()
      if (saved) {
        setCustomer(saved)
      }
    }
  }, [autoIdentify])

  // AIDEV-NOTE: Identify/create customer by phone
  const identify = useCallback(async (phone: string, name?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const normalizedPhone = normalizePhone(phone)

      if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
        throw new Error("Telefone invalido")
      }

      // Check if customer exists in localStorage
      const saved = loadCustomerFromStorage()

      if (saved && normalizePhone(saved.phone) === normalizedPhone) {
        // Existing customer from storage
        setCustomer(saved)
        return saved
      }

      // Create new customer
      const newCustomer: Customer = {
        name: name || "Cliente",
        phone: formatPhone(normalizedPhone),
        createdAt: new Date(),
      }

      setCustomer(newCustomer)
      saveCustomerToStorage(newCustomer)

      return newCustomer
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to identify customer")
      setError(errorObj)
      throw errorObj
    } finally {
      setIsLoading(false)
    }
  }, [])

  // AIDEV-NOTE: Update customer data
  const updateCustomer = useCallback((updates: Partial<Omit<Customer, "phone">>) => {
    setCustomer((prev) => {
      if (!prev) return null

      const updated = {
        ...prev,
        ...updates,
      }

      return updated
    })
  }, [])

  // AIDEV-NOTE: Save customer to backend/storage
  const saveCustomer = useCallback(async () => {
    if (!customer) {
      throw new Error("Nenhum cliente identificado")
    }

    setIsSaving(true)
    setError(null)

    try {
      saveCustomerToStorage(customer)
      await onSave?.(customer)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to save customer")
      setError(errorObj)
      throw errorObj
    } finally {
      setIsSaving(false)
    }
  }, [customer, onSave])

  // AIDEV-NOTE: Clear customer data
  const clearCustomer = useCallback(() => {
    setCustomer(null)
    saveCustomerToStorage(null)
  }, [])

  return {
    customer,
    isIdentified: !!customer,
    isLoading,
    isSaving,
    error,
    identify,
    updateCustomer,
    saveCustomer,
    clearCustomer,
  }
}

// AIDEV-NOTE: Hook for phone validation
export function usePhoneValidation() {
  const validate = useCallback((phone: string): { valid: boolean; formatted?: string } => {
    const normalized = normalizePhone(phone)

    if (normalized.length < 10 || normalized.length > 11) {
      return { valid: false }
    }

    return {
      valid: true,
      formatted: formatPhone(normalized),
    }
  }, [])

  return { validate }
}

// AIDEV-NOTE: Hook for customer name management
export function useCustomerName() {
  const [name, setName] = useState("")
  const [isValid, setIsValid] = useState(false)

  const validate = useCallback((input: string) => {
    const trimmed = input.trim()
    const valid = trimmed.length >= 2
    setIsValid(valid)
    return valid
  }, [])

  const update = useCallback((input: string) => {
    setName(input.trim())
    return validate(input)
  }, [validate])

  const clear = useCallback(() => {
    setName("")
    setIsValid(false)
  }, [])

  return {
    name,
    isValid,
    update,
    clear,
    validate,
  }
}

// TASK-040: Address form component for delivery
// AIDEV-NOTE: Collects street, number, complement, neighborhood

"use client"

import * as React from "react"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface AddressFormData {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city?: string
  state?: string
  zipCode?: string
}

interface AddressFormProps {
  value: AddressFormData
  onChange: (value: AddressFormData) => void
  className?: string
  showCityState?: boolean
  showZipCode?: boolean
  required?: boolean
  errors?: Partial<Record<keyof AddressFormData, string>>
}

export function AddressForm({
  value,
  onChange,
  className,
  showCityState = false,
  showZipCode = false,
  required = false,
  errors,
}: AddressFormProps) {
  // AIDEV-NOTE: Update specific field
  const updateField = <K extends keyof AddressFormData>(
    field: K,
    fieldValue: AddressFormData[K]
  ) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 pb-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Endereco de Entrega</h3>
        {required && <span className="text-destructive">*</span>}
      </div>

      {/* Street */}
      <div className="space-y-2">
        <Label htmlFor="street">
          Rua {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="street"
          value={value.street}
          onChange={(e) => updateField("street", e.target.value)}
          placeholder="Rua Exemplo"
          aria-invalid={!!errors?.street}
          aria-describedby={errors?.street ? "street-error" : undefined}
        />
        {errors?.street && (
          <p id="street-error" className="text-sm text-destructive" role="alert">
            {errors.street}
          </p>
        )}
      </div>

      {/* Number and Complement */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">
            Numero {required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="number"
            value={value.number}
            onChange={(e) => updateField("number", e.target.value)}
            placeholder="123"
            aria-invalid={!!errors?.number}
            aria-describedby={errors?.number ? "number-error" : undefined}
          />
          {errors?.number && (
            <p id="number-error" className="text-sm text-destructive" role="alert">
              {errors.number}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={value.complement || ""}
            onChange={(e) => updateField("complement", e.target.value)}
            placeholder="Apto, Bloco..."
          />
        </div>
      </div>

      {/* Neighborhood */}
      <div className="space-y-2">
        <Label htmlFor="neighborhood">
          Bairro {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="neighborhood"
          value={value.neighborhood}
          onChange={(e) => updateField("neighborhood", e.target.value)}
          placeholder="Centro"
          aria-invalid={!!errors?.neighborhood}
          aria-describedby={errors?.neighborhood ? "neighborhood-error" : undefined}
        />
        {errors?.neighborhood && (
          <p id="neighborhood-error" className="text-sm text-destructive" role="alert">
            {errors.neighborhood}
          </p>
        )}
      </div>

      {/* Optional: City and State */}
      {showCityState && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={value.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Sao Paulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={value.state || ""}
              onChange={(e) => updateField("state", e.target.value)}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>
      )}

      {/* Optional: ZIP Code */}
      {showZipCode && (
        <div className="space-y-2">
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            value={value.zipCode || ""}
            onChange={(e) => updateField("zipCode", e.target.value)}
            placeholder="00000-000"
            maxLength={9}
          />
        </div>
      )}
    </div>
  )
}

// AIDEV-NOTE: Validate required address fields
export function validateAddress(
  address: AddressFormData,
  required: boolean = true
): Partial<Record<keyof AddressFormData, string>> | null {
  const errors: Partial<Record<keyof AddressFormData, string>> = {}

  if (required) {
    if (!address.street?.trim()) {
      errors.street = "Rua e obrigatorio"
    }
    if (!address.number?.trim()) {
      errors.number = "Numero e obrigatorio"
    }
    if (!address.neighborhood?.trim()) {
      errors.neighborhood = "Bairro e obrigatorio"
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}

// AIDEV-NOTE: Format address for display
export function formatAddress(address: AddressFormData): string {
  const parts: string[] = []

  if (address.street) {
    parts.push(address.street)
  }

  if (address.number) {
    parts.push(address.number)
  }

  if (address.complement) {
    parts.push(`- ${address.complement}`)
  }

  if (address.neighborhood) {
    parts.push(address.neighborhood)
  }

  if (address.city && address.state) {
    parts.push(`${address.city}/${address.state}`)
  } else if (address.city) {
    parts.push(address.city)
  } else if (address.state) {
    parts.push(address.state)
  }

  return parts.join(", ")
}

// AIDEV-NOTE: Create empty address form data
export function createEmptyAddress(): AddressFormData {
  return {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  }
}

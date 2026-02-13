"use client"

// TASK-027: Checkout form component for address and payment
// AIDEV-NOTE: Collects customer information for order completion

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// AIDEV-NOTE: Payment method options
export type PaymentMethod = "cash" | "card" | "pix" | "debit"

export interface CheckoutData {
  customerName: string
  customerPhone: string
  customerAddress: string
  addressNumber?: string
  addressComplement?: string
  paymentMethod: PaymentMethod
  notes?: string
}

interface CheckoutFormProps {
  isLoading?: boolean
  onSubmit: (data: CheckoutData) => void | Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<CheckoutData>
  availablePaymentMethods?: PaymentMethod[]
  currency?: string
  total?: number
  className?: string
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  card: "Cartao de credito",
  pix: "PIX",
  debit: "Cartao de debito",
}

export function CheckoutForm({
  isLoading = false,
  onSubmit,
  onCancel,
  defaultValues,
  availablePaymentMethods = ["cash", "card", "pix", "debit"],
  currency = "R$",
  total,
  className,
}: CheckoutFormProps) {
  const [formData, setFormData] = React.useState<CheckoutData>({
    customerName: defaultValues?.customerName ?? "",
    customerPhone: defaultValues?.customerPhone ?? "",
    customerAddress: defaultValues?.customerAddress ?? "",
    addressNumber: defaultValues?.addressNumber ?? "",
    addressComplement: defaultValues?.addressComplement ?? "",
    paymentMethod: defaultValues?.paymentMethod ?? "cash",
    notes: defaultValues?.notes ?? "",
  })

  const [errors, setErrors] = React.useState<Partial<Record<keyof CheckoutData, string>>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleChange = (
    field: keyof CheckoutData,
    value: string | PaymentMethod
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutData, string>> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Nome e obrigatorio"
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Telefone e obrigatorio"
    } else if (!/^\d{10,11}$/.test(formData.customerPhone.replace(/\D/g, ""))) {
      newErrors.customerPhone = "Telefone invalido"
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = "Endereco e obrigatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Finalizar pedido</CardTitle>
        <CardDescription>
          Preencha seus dados para concluir o pedido
          {total !== undefined && (
            <span className="block mt-1 text-base font-semibold text-foreground">
              Total: {currency} {total.toFixed(2)}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="Seu nome completo"
              value={formData.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              disabled={isLoading || isSubmitting}
              aria-invalid={!!errors.customerName}
              aria-describedby={errors.customerName ? "customerName-error" : undefined}
            />
            {errors.customerName && (
              <p id="customerName-error" className="text-sm text-destructive">
                {errors.customerName}
              </p>
            )}
          </div>

          {/* Customer phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone">
              Telefone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.customerPhone}
              onChange={(e) => handleChange("customerPhone", e.target.value)}
              disabled={isLoading || isSubmitting}
              aria-invalid={!!errors.customerPhone}
              aria-describedby={errors.customerPhone ? "customerPhone-error" : undefined}
            />
            {errors.customerPhone && (
              <p id="customerPhone-error" className="text-sm text-destructive">
                {errors.customerPhone}
              </p>
            )}
          </div>

          {/* Customer address */}
          <div className="space-y-2">
            <Label htmlFor="customerAddress">
              Endereco <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerAddress"
              placeholder="Rua, Avenida, etc."
              value={formData.customerAddress}
              onChange={(e) => handleChange("customerAddress", e.target.value)}
              disabled={isLoading || isSubmitting}
              aria-invalid={!!errors.customerAddress}
              aria-describedby={errors.customerAddress ? "customerAddress-error" : undefined}
            />
            {errors.customerAddress && (
              <p id="customerAddress-error" className="text-sm text-destructive">
                {errors.customerAddress}
              </p>
            )}
          </div>

          {/* Address number and complement */}
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="addressNumber">Numero</Label>
              <Input
                id="addressNumber"
                placeholder="123"
                value={formData.addressNumber ?? ""}
                onChange={(e) => handleChange("addressNumber", e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressComplement">Complemento</Label>
              <Input
                id="addressComplement"
                placeholder="Apto, bloco, referencia..."
                value={formData.addressComplement ?? ""}
                onChange={(e) => handleChange("addressComplement", e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>
              Forma de pagamento <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {availablePaymentMethods.map((method) => (
                <PaymentMethodButton
                  key={method}
                  method={method}
                  label={PAYMENT_METHOD_LABELS[method]}
                  selected={formData.paymentMethod === method}
                  onSelect={() => handleChange("paymentMethod", method)}
                  disabled={isLoading || isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Order notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes do pedido</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Sem cebola, troco para 50, etc."
              value={formData.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              disabled={isLoading || isSubmitting}
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Processando..." : "Confirmar pedido"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// AIDEV-NOTE: Payment method selector button
interface PaymentMethodButtonProps {
  method: PaymentMethod
  label: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

function PaymentMethodButton({
  method,
  label,
  selected,
  onSelect,
  disabled,
}: PaymentMethodButtonProps) {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      onClick={onSelect}
      disabled={disabled}
      className="w-full justify-start"
      aria-pressed={selected}
    >
      {getPaymentIcon(method)}
      <span className="ml-2">{label}</span>
    </Button>
  )
}

// AIDEV-NOTE: Get icon for payment method
function getPaymentIcon(method: PaymentMethod): React.ReactNode {
  switch (method) {
    case "cash":
      return (
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
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    case "card":
    case "debit":
      return (
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
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    case "pix":
      return (
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
          <path d="M12 2v20M2 12h20" />
          <path d="m4.93 4.93 14.14 14.14M4.93 19.07 19.07 4.93" />
        </svg>
      )
  }
}

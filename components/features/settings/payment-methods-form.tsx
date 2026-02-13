"use client"

// TASK-079: Payment methods form component
// AIDEV-NOTE: Form for managing accepted payment methods

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  paymentMethodsSchema,
  defaultPaymentMethods,
  type PaymentMethodsInput,
  type PaymentMethod,
} from "@/lib/validators/settings"
import { cn } from "@/lib/utils"

interface PaymentMethodsFormProps {
  defaultValues?: PaymentMethod[]
  onSubmit: (data: PaymentMethod[]) => Promise<void>
  isLoading?: boolean
}

// AIDEV-NOTE: Form for managing payment methods with add/remove functionality
export function PaymentMethodsForm({
  defaultValues = defaultPaymentMethods,
  onSubmit,
  isLoading = false,
}: PaymentMethodsFormProps) {
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<PaymentMethodsInput>({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: {
      payment_methods: defaultValues,
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "payment_methods",
  })

  // AIDEV-NOTE: Update form when defaultValues change
  React.useEffect(() => {
    form.reset({ payment_methods: defaultValues })
  }, [defaultValues, form])

  async function handleSubmit(data: PaymentMethodsInput) {
    setIsPending(true)
    try {
      await onSubmit(data.payment_methods)
    } finally {
      setIsPending(false)
    }
  }

  function addPaymentMethod() {
    append({
      id: `custom_${Date.now()}`,
      name: "",
      enabled: true,
      instructions: null,
    })
  }

  const isSubmitting = isPending || isLoading

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formas de Pagamento</CardTitle>
        <CardDescription>
          Configure as formas de pagamento aceitas pelo estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn(
                    "rounded-lg border p-4 space-y-4",
                    !form.watch(`payment_methods.${index}.enabled`) && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                      <FormField
                        control={form.control}
                        name={`payment_methods.${index}.enabled`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Only allow removing custom methods */}
                    {!["pix", "credit_card", "debit_card", "cash"].includes(
                      form.watch(`payment_methods.${index}.id`)
                    ) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`payment_methods.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Pix, Cartao, Dinheiro"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`payment_methods.${index}.instructions`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instrucoes (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Troco para quanto?"
                              disabled={isSubmitting}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Pergunta ou instrucao para o cliente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addPaymentMethod}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Forma de Pagamento
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alteracoes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

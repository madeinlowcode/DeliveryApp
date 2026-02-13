"use client"

// TASK-076: General settings form component
// AIDEV-NOTE: Form for editing establishment general information

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  generalSettingsSchema,
  type GeneralSettingsInput,
} from "@/lib/validators/settings"

interface GeneralFormProps {
  defaultValues?: Partial<GeneralSettingsInput>
  onSubmit: (data: GeneralSettingsInput) => Promise<void>
  isLoading?: boolean
}

// AIDEV-NOTE: Form for updating establishment general settings
export function GeneralForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: GeneralFormProps) {
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      address: defaultValues?.address ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  })

  // AIDEV-NOTE: Update form when defaultValues change (e.g., after data fetch)
  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name ?? "",
        slug: defaultValues.slug ?? "",
        address: defaultValues.address ?? "",
        phone: defaultValues.phone ?? "",
        email: defaultValues.email ?? "",
        is_active: defaultValues.is_active ?? true,
      })
    }
  }, [defaultValues, form])

  async function handleSubmit(data: GeneralSettingsInput) {
    setIsPending(true)
    try {
      await onSubmit(data)
    } finally {
      setIsPending(false)
    }
  }

  const isSubmitting = isPending || isLoading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Estabelecimento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Pizzaria do Joao"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nome que aparecera para os clientes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: pizzaria-do-joao"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Identificador unico na URL (apenas letras minusculas, numeros e hifens)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contato@exemplo.com"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Email para contato e notificacoes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+5511999999999"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Telefone com codigo do pais (usado no WhatsApp)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereco</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Endereco completo do estabelecimento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Estabelecimento Ativo
                </FormLabel>
                <FormDescription>
                  Desative para pausar temporariamente o recebimento de pedidos
                </FormDescription>
              </div>
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alteracoes
        </Button>
      </form>
    </Form>
  )
}

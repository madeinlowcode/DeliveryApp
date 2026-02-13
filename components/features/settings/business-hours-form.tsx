"use client"

// TASK-078: Business hours form component
// AIDEV-NOTE: Form for managing establishment operating hours

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  businessHoursSchema,
  defaultBusinessHours,
  type BusinessHoursInput,
} from "@/lib/validators/settings"

interface BusinessHoursFormProps {
  defaultValues?: BusinessHoursInput
  onSubmit: (data: BusinessHoursInput) => Promise<void>
  isLoading?: boolean
}

// AIDEV-NOTE: Day names for display
const dayLabels: Record<keyof BusinessHoursInput, string> = {
  monday: "Segunda-feira",
  tuesday: "Terca-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sabado",
  sunday: "Domingo",
}

const dayOrder: (keyof BusinessHoursInput)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

// AIDEV-NOTE: Form for managing business operating hours
export function BusinessHoursForm({
  defaultValues = defaultBusinessHours,
  onSubmit,
  isLoading = false,
}: BusinessHoursFormProps) {
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<BusinessHoursInput>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues,
  })

  // AIDEV-NOTE: Update form when defaultValues change
  React.useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  async function handleSubmit(data: BusinessHoursInput) {
    setIsPending(true)
    try {
      await onSubmit(data)
    } finally {
      setIsPending(false)
    }
  }

  const isSubmitting = isPending || isLoading

  // AIDEV-NOTE: Apply same hours to all weekdays
  function applyToWeekdays() {
    const mondayHours = form.getValues("monday")
    const weekdays: (keyof BusinessHoursInput)[] = [
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
    ]

    weekdays.forEach((day) => {
      form.setValue(day, { ...mondayHours })
    })
  }

  // AIDEV-NOTE: Apply same hours to weekend
  function applyToWeekend() {
    const saturdayHours = form.getValues("saturday")
    form.setValue("sunday", { ...saturdayHours })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario de Funcionamento</CardTitle>
        <CardDescription>
          Configure os horarios de abertura e fechamento do seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Quick Apply Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyToWeekdays}
                disabled={isSubmitting}
              >
                Aplicar Segunda a Sexta
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyToWeekend}
                disabled={isSubmitting}
              >
                Aplicar Fim de Semana
              </Button>
            </div>

            {/* Day Rows */}
            <div className="space-y-4">
              {dayOrder.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-[140px_1fr_1fr_auto] items-center gap-4 rounded-lg border p-3"
                >
                  <span className="font-medium">{dayLabels[day]}</span>

                  <FormField
                    control={form.control}
                    name={`${day}.open`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Abertura</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            disabled={isSubmitting || !form.watch(`${day}.is_open`)}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${day}.close`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Fechamento</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            disabled={isSubmitting || !form.watch(`${day}.is_open`)}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${day}.is_open`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {field.value ? "Aberto" : "Fechado"}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Horarios
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

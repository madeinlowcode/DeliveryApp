"use client"

// TASK-080: Settings page with tabs
// AIDEV-NOTE: Main settings page combining all settings forms in a tabbed interface

import * as React from "react"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GeneralForm,
  LogoUpload,
  BusinessHoursForm,
  PaymentMethodsForm,
} from "@/components/features/settings"
import { settingsService } from "@/services/settings.service"
import type { EstablishmentSettings } from "@/services/settings.service"
import type {
  GeneralSettingsInput,
  BusinessHoursInput,
  PaymentMethod,
} from "@/lib/validators/settings"

// AIDEV-NOTE: Mock tenant ID - in production, this comes from auth context
const MOCK_TENANT_ID = "00000000-0000-0000-0000-000000000001"

export default function ConfiguracoesPage() {
  const [settings, setSettings] = React.useState<EstablishmentSettings | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("general")

  // AIDEV-NOTE: Load settings on mount
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsService.getSettings(MOCK_TENANT_ID)
        if (data) {
          setSettings(data)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast.error("Erro ao carregar configuracoes")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // AIDEV-NOTE: Handler for general settings update
  async function handleGeneralSubmit(data: GeneralSettingsInput) {
    try {
      await settingsService.updateGeneralSettings(MOCK_TENANT_ID, data)
      toast.success("Configuracoes gerais salvas com sucesso!")
    } catch (error) {
      console.error("Error saving general settings:", error)
      toast.error("Erro ao salvar configuracoes")
      throw error
    }
  }

  // AIDEV-NOTE: Handler for logo upload
  async function handleLogoUpload(file: File): Promise<string> {
    try {
      // AIDEV-TODO: Implement actual upload using signed URL API
      // For now, create a local preview URL
      const url = URL.createObjectURL(file)

      await settingsService.updateLogo(MOCK_TENANT_ID, url)
      toast.success("Logo atualizado com sucesso!")
      return url
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Erro ao fazer upload do logo")
      throw error
    }
  }

  // AIDEV-NOTE: Handler for logo removal
  async function handleLogoRemove() {
    try {
      await settingsService.updateLogo(MOCK_TENANT_ID, null)
      setSettings((prev) => (prev ? { ...prev, logo_url: null } : null))
      toast.success("Logo removido com sucesso!")
    } catch (error) {
      console.error("Error removing logo:", error)
      toast.error("Erro ao remover logo")
      throw error
    }
  }

  // AIDEV-NOTE: Handler for business hours update
  async function handleBusinessHoursSubmit(data: BusinessHoursInput) {
    try {
      await settingsService.updateBusinessHours(MOCK_TENANT_ID, data)
      toast.success("Horarios de funcionamento salvos com sucesso!")
    } catch (error) {
      console.error("Error saving business hours:", error)
      toast.error("Erro ao salvar horarios")
      throw error
    }
  }

  // AIDEV-NOTE: Handler for payment methods update
  async function handlePaymentMethodsSubmit(data: PaymentMethod[]) {
    try {
      await settingsService.updatePaymentMethods(MOCK_TENANT_ID, data)
      toast.success("Formas de pagamento salvas com sucesso!")
    } catch (error) {
      console.error("Error saving payment methods:", error)
      toast.error("Erro ao salvar formas de pagamento")
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracoes</h1>
        <p className="text-muted-foreground">
          Gerencie as configuracoes do seu estabelecimento
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralForm
            defaultValues={{
              name: settings?.name ?? "",
              slug: settings?.slug ?? "",
              address: settings?.address ?? "",
              phone: settings?.phone ?? "",
              email: settings?.email ?? "",
              is_active: settings?.is_active ?? true,
            }}
            onSubmit={handleGeneralSubmit}
          />
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <LogoUpload
            currentLogoUrl={settings?.logo_url}
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
          />
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <BusinessHoursForm
            defaultValues={settings?.business_hours}
            onSubmit={handleBusinessHoursSubmit}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentMethodsForm
            defaultValues={settings?.payment_methods}
            onSubmit={handlePaymentMethodsSubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

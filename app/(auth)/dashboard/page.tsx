"use client"

// TASK-056: Dashboard page with Kanban board
// AIDEV-NOTE: Main dashboard page displaying the order Kanban board

import * as React from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/shared/header"
import { SimpleHeader } from "@/components/shared/header"
import { KanbanBoard } from "@/components/features/kanban/kanban-board"
import { OrderDetailsSheet } from "@/components/features/kanban/order-details-sheet"
import { useOrders } from "@/hooks/use-orders"

// AIDEV-NOTE: Mock tenant ID for development
// In production, this comes from user session/context
const MOCK_TENANT_ID = "00000000-0000-0000-0000-000000000001"

export default function DashboardPage() {
  // AIDEV-NOTE: State for order details sheet
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // AIDEV-NOTE: Get orders hook for status updates
  const { updateStatus, refetch } = useOrders({
    tenantId: MOCK_TENANT_ID,
    autoFetch: false, // KanbanBoard handles its own fetching
  })

  // AIDEV-NOTE: Handle order card click
  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsSheetOpen(true)
  }

  // AIDEV-NOTE: Handle status change from sheet
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus(orderId, newStatus as any)
  }

  // AIDEV-NOTE: Handle manual refresh
  const handleRefresh = () => {
    refetch()
  }

  return (
    <>
      {/* AIDEV-NOTE: Page header with navigation breadcrumb */}
      <Header
        breadcrumbs={[{ title: "Dashboard" }]}
        showSearch
      />

      {/* AIDEV-NOTE: Main content area */}
      <main className="flex flex-1 flex-col">
        {/* Page title and actions */}
        <div className="border-b px-4 py-4 md:px-6">
          <SimpleHeader
            title="Painel de Pedidos"
            description="Gerencie os pedidos do seu estabelecimento em tempo real"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 size-4" />
              Atualizar
            </Button>
          </SimpleHeader>
        </div>

        {/* AIDEV-NOTE: Kanban board takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            tenantId={MOCK_TENANT_ID}
            onOrderClick={handleOrderClick}
            className="h-full"
          />
        </div>
      </main>

      {/* AIDEV-NOTE: Order details slide-over */}
      <OrderDetailsSheet
        orderId={selectedOrderId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onStatusChange={handleStatusChange}
      />
    </>
  )
}

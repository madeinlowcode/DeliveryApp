// TASK-016: Tool renderer component for displaying AI tool outputs
// AIDEV-NOTE: Switch/case router for rendering different tool outputs as UI

"use client"

import type { CategoryWithCount, AIProductDisplay } from "@/lib/ai/ai-menu.service"
import { CategoryCards } from "./category-cards"
import { ProductCards } from "./product-cards"
import { cn } from "@/lib/utils"

// AIDEV-NOTE: Props for tool renderer
interface ToolRendererProps {
  toolName: string
  toolArgs: Record<string, unknown>
}

// AIDEV-NOTE: Tool output types from AI agent
interface ToolOutputCategories {
  categories: CategoryWithCount[]
}

interface ToolOutputProducts {
  products: AIProductDisplay[]
}

interface ToolOutputProductDetail {
  product: AIProductDisplay
}

interface ToolOutputCart {
  items: unknown[]
  total: number
  itemCount: number
}

interface ToolOutputOrderConfirmation {
  orderNumber: string
  estimatedTime: string
  total: number
}

export function ToolRenderer({ toolName, toolArgs }: ToolRendererProps) {
  // AIDEV-NOTE: Route to appropriate component based on tool name
  switch (toolName) {
    case "show_categories": {
      const data = toolArgs as unknown as ToolOutputCategories
      return <CategoryCardsOutput data={data} />
    }
    case "show_products": {
      const data = toolArgs as unknown as ToolOutputProducts
      return <ProductsOutput data={data} />
    }
    case "show_product_detail": {
      const data = toolArgs as unknown as ToolOutputProductDetail
      return <ProductDetailOutput data={data} />
    }
    case "show_cart": {
      const data = toolArgs as unknown as ToolOutputCart
      return <CartOutput data={data} />
    }
    case "show_order_confirmation": {
      const data = toolArgs as unknown as ToolOutputOrderConfirmation
      return <OrderConfirmationOutput data={data} />
    }
    case "show_business_hours": {
      return <BusinessHoursOutput data={toolArgs} />
    }
    case "show_order_status": {
      return <OrderStatusOutput data={toolArgs} />
    }
    default:
      return <UnknownToolOutput toolName={toolName} data={toolArgs} />
  }
}

// AIDEV-NOTE: Render category cards
function CategoryCardsOutput({ data }: { data: ToolOutputCategories }) {
  return <CategoryCards categories={data.categories} />
}

// AIDEV-NOTE: Render product cards
function ProductsOutput({ data }: { data: ToolOutputProducts }) {
  return <ProductCards products={data.products} />
}

// AIDEV-NOTE: Render product detail (placeholder - modal implementation in later tasks)
function ProductDetailOutput({ data }: { data: ToolOutputProductDetail }) {
  return (
    <div data-slot="tool-product-detail" className="text-sm text-muted-foreground">
      Produto: {data.product.name} - {data.product.priceFormatted}
    </div>
  )
}

// AIDEV-NOTE: Render cart summary
function CartOutput({ data }: { data: ToolOutputCart }) {
  return (
    <div data-slot="tool-cart" className="bg-muted/50 rounded-lg p-4 text-sm">
      <p className="font-medium">Carrinho ({data.itemCount} itens)</p>
      <p className="text-lg font-semibold mt-2">Total: R$ {data.total.toFixed(2)}</p>
    </div>
  )
}

// AIDEV-NOTE: Render order confirmation
function OrderConfirmationOutput({ data }: { data: ToolOutputOrderConfirmation }) {
  return (
    <div
      data-slot="tool-confirmation"
      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm"
    >
      <p className="font-semibold text-green-800 dark:text-green-300">
        Pedido confirmado!
      </p>
      <p className="mt-2">Número: <span className="font-mono">{data.orderNumber}</span></p>
      <p className="mt-1">Tempo estimado: {data.estimatedTime}</p>
      <p className="mt-2 text-lg font-semibold">Total: R$ {data.total.toFixed(2)}</p>
    </div>
  )
}

// AIDEV-NOTE: Render business hours
function BusinessHoursOutput({ data }: { data: Record<string, unknown> }) {
  const isOpen = data.isOpen as boolean
  const message = data.message as string

  return (
    <div
      data-slot="tool-hours"
      className={cn(
        "rounded-lg p-4 text-sm",
        isOpen
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      )}
    >
      <p className="font-semibold">{message}</p>
    </div>
  )
}

// AIDEV-NOTE: Render order status
function OrderStatusOutput({ data }: { data: Record<string, unknown> }) {
  const status = data.status as string
  const orderNumber = data.orderNumber as string

  return (
    <div data-slot="tool-status" className="bg-muted/50 rounded-lg p-4 text-sm">
      <p className="font-medium">Pedido {orderNumber}</p>
      <p className="mt-1">Status: <span className="font-semibold">{status}</span></p>
    </div>
  )
}

// AIDEV-NOTE: Fallback for unknown tools
function UnknownToolOutput({ toolName, data }: { toolName: string; data: Record<string, unknown> }) {
  return (
    <div
      data-slot="tool-unknown"
      className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground border border-dashed"
    >
      <p className="font-medium">Tool: {toolName}</p>
      <pre className="mt-2 overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

// TASK-026, TASK-027: Get Products Tool
// AIDEV-NOTE: Tool factory for AI agent to fetch products with formatting

import { dynamicTool } from "ai"
import { z } from "zod"
import { aiMenuService, type AIProductDisplay } from "@/lib/ai/ai-menu.service"
import type { ToolContext } from "./get-categories"

// AIDEV-NOTE: Format product for AI response with price and options
function formatProductForDisplay(product: AIProductDisplay): string {
  let display = `- ${product.name}: ${product.priceFormatted}`

  if (product.description) {
    display += ` - ${product.description}`
  }

  if (product.variations.length > 0) {
    const varOptions = product.variations
      .map((v) => {
        const modifier = v.priceModifier > 0 ? ` (+R$ ${v.priceModifier.toFixed(2)})` : ""
        return `${v.name}${modifier}`
      })
      .join(", ")
    display += ` | Tamanhos: ${varOptions}`
  }

  if (product.addons.length > 0) {
    const addonOptions = product.addons
      .map((a) => `${a.name} (+R$ ${a.price.toFixed(2)})`)
      .join(", ")
    display += ` | Adicionais: ${addonOptions}`
  }

  return display
}

// AIDEV-NOTE: Factory function to create tool with context
export function createGetProductsTool(context: ToolContext) {
  return dynamicTool({
    description:
      "Retorna os produtos do cardapio. Use esta ferramenta quando o cliente perguntar sobre produtos especificos, precos, ou quiser ver itens de uma categoria. Pode filtrar por categoria ou buscar por nome.",
    inputSchema: z.object({
      categoryId: z
        .string()
        .optional()
        .describe("ID da categoria para filtrar produtos. Deixe vazio para todos."),
      searchQuery: z
        .string()
        .optional()
        .describe("Termo de busca para encontrar produtos por nome ou descricao."),
    }),
    execute: async (params: {
      categoryId?: string
      searchQuery?: string
    }, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      success: boolean
      products: AIProductDisplay[]
      formattedList: string
      message: string
    }> => {
      try {
        let products: AIProductDisplay[]

        if (params.searchQuery) {
          products = await aiMenuService.searchProducts(context.tenantId, params.searchQuery)
        } else {
          products = await aiMenuService.getProductsByCategory(context.tenantId, params.categoryId)
        }

        if (products.length === 0) {
          return {
            success: true,
            products: [],
            formattedList: "",
            message: params.searchQuery
              ? `Nao encontrei produtos com "${params.searchQuery}". Tente outro termo.`
              : "Nao ha produtos disponiveis nesta categoria.",
          }
        }

        // Format products for display
        const formattedList = products.map(formatProductForDisplay).join("\n")

        return {
          success: true,
          products,
          formattedList,
          message: `Encontrei ${products.length} produto(s):\n\n${formattedList}`,
        }
      } catch (error) {
        console.error("[getProducts] Error:", error)
        return {
          success: false,
          products: [],
          formattedList: "",
          message: "Erro ao buscar produtos. Tente novamente.",
        }
      }
    },
  })
}

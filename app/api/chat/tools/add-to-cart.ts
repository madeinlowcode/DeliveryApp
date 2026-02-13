// TASK-030, TASK-031: Add to Cart Tool
// AIDEV-NOTE: Tool factory for AI agent to add items to cart with validation and price calculation

import { dynamicTool } from "ai"
import { z } from "zod"
import { CartManager } from "@/lib/cart"
import { aiMenuService } from "@/lib/ai/ai-menu.service"
import type { CartAddonInput } from "@/types/cart"
import type { ToolContext } from "./get-categories"

// AIDEV-NOTE: Factory function to create tool with context
export function createAddToCartTool(context: ToolContext) {
  return dynamicTool({
    description:
      "Adiciona um produto ao carrinho do cliente. Use quando o cliente quiser pedir algo, solicitar um item, ou adicionar ao pedido. Valida se o produto existe e calcula o preco automaticamente.",
    inputSchema: z.object({
      productId: z.string().describe("ID do produto a ser adicionado."),
      quantity: z
        .number()
        .int()
        .positive()
        .default(1)
        .describe("Quantidade do produto. Padrao: 1."),
      variationId: z
        .string()
        .optional()
        .describe("ID da variacao escolhida (tamanho, sabor, etc)."),
      addonIds: z
        .array(z.string())
        .optional()
        .describe("Lista de IDs dos adicionais selecionados."),
      notes: z
        .string()
        .optional()
        .describe("Observacoes do cliente sobre o item (ex: sem cebola)."),
    }),
    execute: async (params: {
      productId: string
      quantity: number
      variationId?: string
      addonIds?: string[]
      notes?: string
    }, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      success: boolean
      itemId?: string
      itemName?: string
      quantity?: number
      unitPrice?: number
      itemTotal?: number
      cartItemCount?: number
      message: string
    }> => {
      try {
        // AIDEV-NOTE: Fetch product details to validate and get prices
        const product = await aiMenuService.getProductById(context.tenantId, params.productId)

        if (!product) {
          return {
            success: false,
            message: "Produto nao encontrado. Por favor, escolha um produto do cardapio.",
          }
        }

        if (!product.isAvailable) {
          return {
            success: false,
            message: `Desculpe, ${product.name} esta indisponivel no momento.`,
          }
        }

        // AIDEV-NOTE: Find selected variation if specified
        let variationName: string | undefined
        let variationPriceModifier = 0

        if (params.variationId) {
          const variation = product.variations.find((v) => v.id === params.variationId)
          if (!variation) {
            return {
              success: false,
              message: `Opcao de variacao invalida para ${product.name}.`,
            }
          }
          variationName = variation.name
          variationPriceModifier = variation.priceModifier
        }

        // AIDEV-NOTE: Process addons if specified
        const addons: CartAddonInput[] = []
        if (params.addonIds && params.addonIds.length > 0) {
          for (const addonId of params.addonIds) {
            const addon = product.addons.find((a) => a.id === addonId)
            if (!addon) {
              continue // Skip invalid addons silently
            }
            addons.push({
              addonId: addon.id,
              addonName: addon.name,
              price: addon.price,
              quantity: 1,
            })
          }
        }

        // AIDEV-NOTE: Get cart manager and add item
        const cartManager = CartManager.getInstance(context.sessionId, context.tenantId)

        const cartItem = cartManager.addItem({
          productId: product.id,
          productName: product.name,
          basePrice: product.price,
          quantity: params.quantity,
          variationId: params.variationId,
          variationName,
          variationPriceModifier,
          addons,
          notes: params.notes,
        })

        const unitPrice = product.price + variationPriceModifier
        const itemCount = cartManager.getItemCount()

        // AIDEV-NOTE: Build confirmation message
        let confirmMsg = `Adicionei ${params.quantity}x ${product.name}`
        if (variationName) {
          confirmMsg += ` (${variationName})`
        }
        confirmMsg += ` ao seu carrinho.`
        confirmMsg += ` Total do item: R$ ${cartItem.itemTotal.toFixed(2)}.`
        confirmMsg += ` Voce tem ${itemCount} item(ns) no carrinho.`

        return {
          success: true,
          itemId: cartItem.id,
          itemName: product.name,
          quantity: params.quantity,
          unitPrice,
          itemTotal: cartItem.itemTotal,
          cartItemCount: itemCount,
          message: confirmMsg,
        }
      } catch (error) {
        console.error("[addToCart] Error:", error)
        return {
          success: false,
          message: "Erro ao adicionar item ao carrinho. Tente novamente.",
        }
      }
    },
  })
}

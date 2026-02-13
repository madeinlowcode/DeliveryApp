// TASK-034, TASK-035: Get Cart Tool
// AIDEV-NOTE: Tool factory for AI agent to retrieve complete cart state

import { dynamicTool } from "ai"
import { z } from "zod"
import { CartManager, type CartSummary } from "@/lib/cart"
import type { ToolContext } from "./get-categories"

// AIDEV-NOTE: Format cart summary for AI display
function formatCartSummary(summary: CartSummary): string {
  if (summary.itemCount === 0) {
    return "Seu carrinho esta vazio."
  }

  const lines: string[] = ["Itens no carrinho:"]

  summary.items.forEach((item, index) => {
    let line = `${index + 1}. ${item.name}`
    if (item.variation) {
      line += ` (${item.variation})`
    }
    line += ` x${item.quantity} - R$ ${item.total.toFixed(2)}`
    lines.push(line)

    if (item.addons && item.addons.length > 0) {
      lines.push(`   Adicionais: ${item.addons.join(", ")}`)
    }

    if (item.notes) {
      lines.push(`   Obs: ${item.notes}`)
    }
  })

  lines.push("")
  lines.push(`Subtotal: R$ ${summary.subtotal.toFixed(2)}`)

  if (summary.deliveryFee > 0) {
    lines.push(`Taxa de entrega: R$ ${summary.deliveryFee.toFixed(2)}`)
  }

  lines.push(`Total: R$ ${summary.total.toFixed(2)}`)

  return lines.join("\n")
}

// AIDEV-NOTE: Factory function to create tool with context
export function createGetCartTool(context: ToolContext) {
  return dynamicTool({
    description:
      "Retorna o carrinho completo do cliente com todos os itens, quantidades e totais. Use quando o cliente perguntar o que tem no carrinho, quiser revisar o pedido, ou antes de finalizar.",
    inputSchema: z.object({
      // AIDEV-NOTE: No parameters needed - uses session context
    }),
    execute: async (_: {}, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      success: boolean
      isEmpty: boolean
      summary: CartSummary
      formattedCart: string
      message: string
    }> => {
      try {
        const cartManager = CartManager.getInstance(context.sessionId, context.tenantId)
        const summary = cartManager.getCartSummary()
        const isEmpty = cartManager.isEmpty()

        const formattedCart = formatCartSummary(summary)

        let message: string
        if (isEmpty) {
          message = "Seu carrinho esta vazio. Gostaria de ver nosso cardapio?"
        } else {
          message = `Seu carrinho:\n\n${formattedCart}\n\nDeseja finalizar o pedido, adicionar mais itens ou remover algo?`
        }

        return {
          success: true,
          isEmpty,
          summary,
          formattedCart,
          message,
        }
      } catch (error) {
        console.error("[getCart] Error:", error)
        return {
          success: false,
          isEmpty: true,
          summary: {
            itemCount: 0,
            subtotal: 0,
            deliveryFee: 0,
            total: 0,
            items: [],
          },
          formattedCart: "",
          message: "Erro ao buscar carrinho. Tente novamente.",
        }
      }
    },
  })
}

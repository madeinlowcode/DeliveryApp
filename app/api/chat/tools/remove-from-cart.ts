// TASK-032, TASK-033: Remove from Cart Tool
// AIDEV-NOTE: Tool factory for AI agent to remove items from cart

import { dynamicTool } from "ai"
import { z } from "zod"
import { CartManager } from "@/lib/cart"
import type { ToolContext } from "./get-categories"

// AIDEV-NOTE: Factory function to create tool with context
export function createRemoveFromCartTool(context: ToolContext) {
  return dynamicTool({
    description:
      "Remove um item do carrinho do cliente. Use quando o cliente quiser retirar algo do pedido ou cancelar um item especifico. Use getCart primeiro para ver os IDs dos itens.",
    inputSchema: z.object({
      itemId: z.string().describe("ID do item no carrinho a ser removido."),
    }),
    execute: async (params: { itemId: string }, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      success: boolean
      removedItemId?: string
      remainingItems?: number
      newTotal?: number
      message: string
    }> => {
      try {
        const cartManager = CartManager.getInstance(context.sessionId, context.tenantId)

        // AIDEV-NOTE: Check if cart is empty
        if (cartManager.isEmpty()) {
          return {
            success: false,
            message: "Seu carrinho ja esta vazio.",
          }
        }

        // AIDEV-NOTE: Get current cart to find item name for confirmation
        const cart = cartManager.getCart()
        const itemToRemove = cart.items.find((item) => item.id === params.itemId)

        if (!itemToRemove) {
          return {
            success: false,
            message: "Item nao encontrado no carrinho. Verifique o ID do item.",
          }
        }

        const itemName = itemToRemove.productName

        // AIDEV-NOTE: Remove the item
        cartManager.removeItem(params.itemId)

        // AIDEV-NOTE: Get updated cart stats
        const remainingItems = cartManager.getItemCount()
        const updatedCart = cartManager.getCart()

        let confirmMsg = `Removi ${itemName} do seu carrinho.`

        if (remainingItems === 0) {
          confirmMsg += " Seu carrinho esta vazio agora."
        } else {
          confirmMsg += ` Voce ainda tem ${remainingItems} item(ns) totalizando R$ ${updatedCart.total.toFixed(2)}.`
        }

        return {
          success: true,
          removedItemId: params.itemId,
          remainingItems,
          newTotal: updatedCart.total,
          message: confirmMsg,
        }
      } catch (error) {
        console.error("[removeFromCart] Error:", error)

        // AIDEV-NOTE: Check if error is about item not found
        if (error instanceof Error && error.message.includes("not found")) {
          return {
            success: false,
            message: "Item nao encontrado no carrinho.",
          }
        }

        return {
          success: false,
          message: "Erro ao remover item do carrinho. Tente novamente.",
        }
      }
    },
  })
}

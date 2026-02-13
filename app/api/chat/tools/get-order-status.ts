// TASK-038, TASK-039: Get Order Status Tool
// AIDEV-NOTE: Tool factory for AI agent to check order status

import { dynamicTool } from "ai"
import { z } from "zod"
import { orderService } from "@/lib/ai/order.service"
import type { ToolContext } from "./get-categories"

// AIDEV-NOTE: Factory function to create tool with context
export function createGetOrderStatusTool(context: ToolContext) {
  return dynamicTool({
    description:
      "Consulta o status de um pedido. Use quando o cliente perguntar sobre seu pedido, quiser acompanhar ou saber onde esta. Pode buscar pelo numero do pedido ou telefone.",
    inputSchema: z.object({
      orderNumber: z
        .string()
        .optional()
        .describe("Numero do pedido para consulta (ex: ABC123)."),
      customerPhone: z
        .string()
        .optional()
        .describe("Telefone do cliente para buscar pedidos recentes."),
    }),
    execute: async (params: {
      orderNumber?: string
      customerPhone?: string
    }, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      success: boolean
      found: boolean
      order?: {
        id: string
        orderNumber: string
        status: string
        statusText: string
        customerName: string
        total: number
        totalFormatted: string
        itemCount: number
        createdAt: string
      }
      message: string
    }> => {
      try {
        // AIDEV-NOTE: Validate we have at least one search parameter
        if (!params.orderNumber && !params.customerPhone) {
          return {
            success: false,
            found: false,
            message: "Por favor, informe o numero do pedido ou seu telefone para consultar.",
          }
        }

        // AIDEV-NOTE: Clean phone number if provided
        const cleanPhone = params.customerPhone?.replace(/\D/g, "")

        const result = await orderService.getOrderStatus(
          context.tenantId,
          params.orderNumber,
          cleanPhone
        )

        if (!result.found) {
          return {
            success: true,
            found: false,
            message: result.message,
          }
        }

        // AIDEV-NOTE: Build detailed status message
        let statusMessage = `Pedido #${result.order!.orderNumber}\n`
        statusMessage += `Status: ${result.order!.statusText}\n`
        statusMessage += `Cliente: ${result.order!.customerName}\n`
        statusMessage += `Total: ${result.order!.totalFormatted}\n`
        statusMessage += `Realizado em: ${result.order!.createdAt}`

        return {
          success: true,
          found: true,
          order: result.order,
          message: statusMessage,
        }
      } catch (error) {
        console.error("[getOrderStatus] Error:", error)
        return {
          success: false,
          found: false,
          message: "Erro ao consultar pedido. Tente novamente.",
        }
      }
    },
  })
}

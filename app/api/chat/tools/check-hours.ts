// TASK-028, TASK-029: Check Operating Hours Tool
// AIDEV-NOTE: Tool factory for AI agent to check if establishment is open

import { dynamicTool } from "ai"
import { z } from "zod"
import { operatingHoursService } from "@/lib/ai/operating-hours.service"
import type { BusinessHours } from "@/types/cart"
import type { ToolContext } from "./get-categories"

// AIDEV-NOTE: Extended context with business hours
export interface CheckHoursContext extends ToolContext {
  businessHours?: BusinessHours
}

// AIDEV-NOTE: Factory function to create tool with context
export function createCheckHoursTool(context: CheckHoursContext) {
  return dynamicTool({
    description:
      "Verifica se o estabelecimento esta aberto no momento. Use quando o cliente perguntar sobre horario de funcionamento ou antes de finalizar um pedido.",
    inputSchema: z.object({
      // AIDEV-NOTE: No parameters needed - uses current time and tenant config
    }),
    execute: async (_: {}, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      isOpen: boolean
      message: string
      nextOpenTime: string | null
      currentTime: string
    }> => {
      try {
        const result = operatingHoursService.checkIfOpen(context.businessHours)

        return {
          isOpen: result.isOpen,
          message: result.message,
          nextOpenTime: result.nextOpenTime,
          currentTime: result.currentTime,
        }
      } catch (error) {
        console.error("[checkHours] Error:", error)
        return {
          isOpen: false,
          message: "Erro ao verificar horario. Tente novamente.",
          nextOpenTime: null,
          currentTime: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
      }
    },
  })
}

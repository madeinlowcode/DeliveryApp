// TASK-024, TASK-025: Get Categories Tool
// AIDEV-NOTE: Tool factory for AI agent to fetch menu categories

import { dynamicTool } from "ai"
import { z } from "zod"
import { aiMenuService, type CategoryWithCount } from "@/lib/ai/ai-menu.service"

// AIDEV-NOTE: Tool context passed from the route handler
export interface ToolContext {
  tenantId: string
  sessionId: string
}

// AIDEV-NOTE: Factory function to create tool with context
export function createGetCategoriesTool(context: ToolContext) {
  return dynamicTool({
    description:
      "Retorna as categorias do cardapio do estabelecimento. Use esta ferramenta quando o cliente perguntar sobre as opcoes de comida, tipos de produtos disponiveis, ou quiser ver o cardapio.",
    inputSchema: z.object({
      // AIDEV-NOTE: No parameters needed - context provides tenant
    }),
    execute: async (_: {}, options: { toolCallId: string; messages: any[]; abortSignal?: AbortSignal }): Promise<{
      success: boolean
      categories: Array<{
        id: string
        name: string
        description: string | null
        productCount: number
      }>
      message: string
    }> => {
      try {
        const categories = await aiMenuService.getActiveCategories(context.tenantId)

        if (categories.length === 0) {
          return {
            success: true,
            categories: [],
            message: "O cardapio ainda nao possui categorias cadastradas.",
          }
        }

        const formattedCategories = categories.map((cat: CategoryWithCount) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          productCount: cat.productCount,
        }))

        const categoryNames = formattedCategories.map((c) => c.name).join(", ")

        return {
          success: true,
          categories: formattedCategories,
          message: `Temos as seguintes categorias: ${categoryNames}. Qual voce gostaria de ver?`,
        }
      } catch (error) {
        console.error("[getCategories] Error:", error)
        return {
          success: false,
          categories: [],
          message: "Erro ao buscar categorias. Tente novamente.",
        }
      }
    },
  })
}

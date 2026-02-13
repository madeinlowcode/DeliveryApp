// TASK-036, TASK-037: Checkout Tool
// AIDEV-NOTE: Tool factory for AI agent to finalize order from cart

import { dynamicTool } from 'ai'
import { z } from 'zod'
import { CartManager } from '@/lib/cart'
import { orderService } from '@/lib/ai/order.service'
import { operatingHoursService } from '@/lib/ai/operating-hours.service'
import type { BusinessHours, CartCustomerInput } from '@/types/cart'
import type { ToolContext } from './get-categories'

// AIDEV-NOTE: Extended context with business hours
// AIDEV-NOTE: T-009 FIX - Added minimumOrder for checkout validation
export interface CheckoutContext extends ToolContext {
  businessHours?: BusinessHours
  minimumOrder?: number
}

// AIDEV-NOTE: Factory function to create tool with context
export function createCheckoutTool(context: CheckoutContext) {
  return dynamicTool({
    description:
      'Finaliza o pedido do cliente criando uma ordem a partir do carrinho. Valida horario de funcionamento, dados do cliente e cria o pedido. Requer nome e telefone do cliente.',
    inputSchema: z.object({
      customerName: z.string().min(2).describe('Nome do cliente para o pedido.'),
      customerPhone: z.string().min(8).describe('Telefone do cliente para contato.'),
      customerAddress: z.string().optional().describe('Endereco de entrega do cliente.'),
      notes: z.string().optional().describe('Observacoes gerais do pedido.'),
      paymentMethod: z.string().optional().describe('Metodo de pagamento escolhido.'),
    }),
    execute: async (
      params: {
        customerName: string
        customerPhone: string
        customerAddress?: string
        notes?: string
        paymentMethod?: string
      },
      _options: { toolCallId?: string; messages?: unknown[]; abortSignal?: AbortSignal }
    ): Promise<{
      success: boolean
      orderId?: string
      orderNumber?: string
      total?: number
      totalFormatted?: string
      message: string
      isStoreClosed?: boolean
    }> => {
      try {
        // AIDEV-NOTE: Step 1 - Check if store is open
        const hoursCheck = operatingHoursService.checkIfOpen(context.businessHours)

        if (!hoursCheck.isOpen) {
          return {
            success: false,
            isStoreClosed: true,
            message: `${hoursCheck.message} ${hoursCheck.nextOpenTime ? `Abriremos ${hoursCheck.nextOpenTime}.` : ''} Nao e possivel finalizar o pedido agora.`,
          }
        }

        // AIDEV-NOTE: Step 2 - Validate cart has items
        const cartManager = CartManager.getInstance(context.sessionId, context.tenantId)

        if (cartManager.isEmpty()) {
          return {
            success: false,
            message: 'Seu carrinho esta vazio. Adicione itens antes de finalizar.',
          }
        }

        const cart = cartManager.getCart()

        // AIDEV-NOTE: T-009 FIX - Validate minimum order value before proceeding
        const minimumOrder = context.minimumOrder ?? 20.0 // Default R$20 if not configured

        if (cart.total < minimumOrder) {
          const minFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(minimumOrder)

          return {
            success: false,
            message: `O valor minimo do pedido e ${minFormatted}. Adicione mais itens ao carrinho para continuar.`,
          }
        }

        // AIDEV-NOTE: Step 3 - Prepare customer data
        const customer: CartCustomerInput = {
          customerName: params.customerName.trim(),
          customerPhone: params.customerPhone.replace(/\D/g, ''), // Remove non-digits
          customerAddress: params.customerAddress?.trim(),
        }

        // AIDEV-NOTE: Step 4 - Create the order
        const orderResult = await orderService.createOrder({
          cart,
          customer,
          notes: params.notes,
          paymentMethod: params.paymentMethod,
        })

        if (!orderResult.success) {
          return {
            success: false,
            message: orderResult.message,
          }
        }

        // AIDEV-NOTE: Step 5 - Clear the cart after successful order
        cartManager.clear()

        // AIDEV-NOTE: Build success message
        const totalFormatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(cart.total)

        const successMsg = [
          `Pedido #${orderResult.orderNumber} criado com sucesso!`,
          `Total: ${totalFormatted}`,
          ``,
          `Obrigado, ${params.customerName}!`,
          `Entraremos em contato pelo telefone ${params.customerPhone} para confirmar.`,
        ].join('\n')

        return {
          success: true,
          orderId: orderResult.orderId,
          orderNumber: orderResult.orderNumber,
          total: cart.total,
          totalFormatted,
          message: successMsg,
        }
      } catch (error) {
        console.error('[checkout] Error:', error)
        return {
          success: false,
          message: 'Erro ao finalizar pedido. Tente novamente.',
        }
      }
    },
  })
}

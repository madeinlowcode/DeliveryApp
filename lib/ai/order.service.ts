// TASK-036: Order Service for creating and querying orders
// AIDEV-NOTE: Service for AI tools to create orders and check status

import { createClient } from '@/lib/supabase/server'
import type { Order, OrderStatus } from '@/types/database'
import type { Cart, CartCustomerInput } from '@/types/cart'

// AIDEV-NOTE: Order creation input from cart
export interface CreateOrderInput {
  cart: Cart
  customer: CartCustomerInput
  notes?: string
  paymentMethod?: string
}

// AIDEV-NOTE: Order creation result
export interface CreateOrderResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  message: string
  error?: string
}

// AIDEV-NOTE: Order status result for customer
export interface OrderStatusResult {
  found: boolean
  order?: {
    id: string
    orderNumber: string
    status: OrderStatus
    statusText: string
    customerName: string
    total: number
    totalFormatted: string
    itemCount: number
    createdAt: string
    estimatedDelivery?: string
  }
  message: string
}

// AIDEV-NOTE: Map order status to Portuguese description
const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: 'Pendente - Aguardando confirmacao',
  confirmed: 'Confirmado - Pedido aceito',
  preparing: 'Preparando - Seu pedido esta sendo preparado',
  ready: 'Pronto - Aguardando entrega',
  out_for_delivery: 'Em entrega - Seu pedido saiu para entrega',
  delivered: 'Entregue - Pedido finalizado',
  cancelled: 'Cancelado',
}

class OrderService {
  // AIDEV-NOTE: Format price for display
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  // AIDEV-NOTE: Generate unique order number
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${timestamp}${random}`
  }

  // AIDEV-NOTE: Create a new order from cart
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    try {
      const { cart, customer, notes } = input
      const supabase = await createClient()

      // Validate cart has items
      if (cart.items.length === 0) {
        return {
          success: false,
          message: 'O carrinho esta vazio. Adicione itens antes de finalizar.',
        }
      }

      const orderNumber = this.generateOrderNumber()

      // AIDEV-NOTE: T-010 FIX - Find or create customer for proper persistence
      // First try to find existing customer by phone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('tenant_id', cart.establishmentId)
        .eq('phone', customer.customerPhone)
        .single()

      let customerId = existingCustomer?.id

      // If no customer exists, create a new one
      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            tenant_id: cart.establishmentId,
            name: customer.customerName,
            phone: customer.customerPhone,
          })
          .select('id')
          .single()

        if (customerError) {
          console.error('[OrderService] Error creating customer:', customerError)
          // Continue without customer_id - order will still be created
        } else {
          customerId = newCustomer?.id
        }
      }

      // Create the order
      // AIDEV-NOTE: T-010 FIX - Include customer_id for proper relation
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          tenant_id: cart.establishmentId,
          customer_id: customerId || null, // AIDEV-NOTE: Link to customer
          customer_name: customer.customerName,
          customer_phone: customer.customerPhone,
          customer_address: customer.customerAddress || null,
          status: 'pending' as OrderStatus,
          total: cart.total,
          notes: notes || null,
        })
        .select()
        .single()

      if (orderError || !order) {
        console.error('[OrderService] Error creating order:', orderError)
        return {
          success: false,
          message: 'Erro ao criar pedido. Tente novamente.',
          error: orderError?.message,
        }
      }

      // Create order items
      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        product_name: item.productName + (item.variationName ? ` (${item.variationName})` : ''),
        quantity: item.quantity,
        unit_price: item.basePrice + item.variationPriceModifier,
        notes:
          [
            item.notes,
            item.addons.length > 0
              ? `Adicionais: ${item.addons.map((a) => a.addonName).join(', ')}`
              : null,
          ]
            .filter(Boolean)
            .join(' | ') || null,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      // AIDEV-NOTE: T-007 FIX - Handle order_items creation failure with rollback
      if (itemsError) {
        console.error('[OrderService] Error creating order items:', itemsError)

        // AIDEV-NOTE: Rollback - delete the order that was created without items
        const { error: deleteError } = await supabase.from('orders').delete().eq('id', order.id)

        if (deleteError) {
          console.error('[OrderService] Error rolling back order:', deleteError)
        }

        return {
          success: false,
          message: 'Erro ao processar itens do pedido. Tente novamente.',
          error: itemsError.message,
        }
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        message: `Pedido #${order.order_number} criado com sucesso! Total: ${this.formatPrice(cart.total)}`,
      }
    } catch (error) {
      console.error('[OrderService] Exception creating order:', error)
      return {
        success: false,
        message: 'Erro inesperado ao criar pedido.',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // AIDEV-NOTE: Get order status by order number or phone
  async getOrderStatus(
    tenantId: string,
    orderNumber?: string,
    customerPhone?: string
  ): Promise<OrderStatusResult> {
    try {
      const supabase = await createClient()

      let query = supabase
        .from('orders')
        .select(
          `
          *,
          order_items(count)
        `
        )
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      // Filter by order number or phone
      if (orderNumber) {
        query = query.eq('order_number', orderNumber.toUpperCase())
      } else if (customerPhone) {
        query = query.eq('customer_phone', customerPhone)
      } else {
        return {
          found: false,
          message: 'Informe o numero do pedido ou telefone para consultar.',
        }
      }

      const { data: orders, error } = await query.limit(1)

      if (error) {
        console.error('[OrderService] Error fetching order:', error)
        return {
          found: false,
          message: 'Erro ao consultar pedido.',
        }
      }

      if (!orders || orders.length === 0) {
        return {
          found: false,
          message: orderNumber
            ? `Pedido #${orderNumber} nao encontrado.`
            : 'Nenhum pedido encontrado para este telefone.',
        }
      }

      const order = orders[0]
      const itemCount = (order.order_items as unknown as { count: number }[])?.[0]?.count || 0

      return {
        found: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          statusText: STATUS_TEXT[order.status],
          customerName: order.customer_name,
          total: order.total,
          totalFormatted: this.formatPrice(order.total),
          itemCount,
          createdAt: new Date(order.created_at).toLocaleString('pt-BR'),
        },
        message: `Pedido #${order.order_number}: ${STATUS_TEXT[order.status]}`,
      }
    } catch (error) {
      console.error('[OrderService] Exception fetching order:', error)
      return {
        found: false,
        message: 'Erro inesperado ao consultar pedido.',
      }
    }
  }

  // AIDEV-NOTE: Get recent orders by phone number
  async getRecentOrdersByPhone(
    tenantId: string,
    customerPhone: string,
    limit: number = 5
  ): Promise<Order[]> {
    try {
      const supabase = await createClient()

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[OrderService] Error fetching recent orders:', error)
        return []
      }

      return orders || []
    } catch (error) {
      console.error('[OrderService] Exception fetching recent orders:', error)
      return []
    }
  }
}

// AIDEV-NOTE: Singleton instance
export const orderService = new OrderService()

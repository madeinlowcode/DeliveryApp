// TASK-012 to TASK-014: AI Order service for the AI agent
// AIDEV-NOTE: Service layer for AI agent order operations - handles order creation and tracking

import { createClient } from "@/lib/supabase/server"
import type { Order, OrderItem, InsertTables } from "@/types/database"
import type { Cart, CartItem } from "@/types/cart"

// AIDEV-NOTE: Type for creating a new order
export interface CreateOrderInput {
  tenantId: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    notes?: string
  }>
  total: number
  notes?: string
  paymentMethod?: string
}

// AIDEV-NOTE: Type for customer data
export interface CustomerData {
  id: string
  name: string
  phone: string
  createdAt: Date
}

// TASK-012: Create a new order from AI agent
export async function createOrder(orderData: CreateOrderInput): Promise<Order> {
  const supabase = await createClient()

  // Generate order number (timestamp-based for uniqueness)
  const orderNumber = generateOrderNumber()

  // Create the order
  const orderInsert: InsertTables<"orders"> = {
    order_number: orderNumber,
    tenant_id: orderData.tenantId,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    customer_address: orderData.customerAddress,
    status: "pending",
    total: orderData.total,
    notes: orderData.notes,
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderInsert)
    .select()
    .single()

  if (orderError) {
    console.error("Error creating order:", orderError)
    throw new Error("Falha ao criar pedido")
  }

  // Create order items
  const itemsInsert: InsertTables<"order_items">[] = orderData.items.map((item) => ({
    order_id: order.id,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    notes: item.notes,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(itemsInsert)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    // AIDEV-NOTE: Order was created but items failed - log for investigation
    // In production, this should be a transaction
  }

  return order
}

// AIDEV-NOTE: Create order from cart (convenience wrapper)
export async function createOrderFromCart(
  cart: Cart,
  customerName: string,
  customerPhone: string,
  customerAddress?: string,
  notes?: string,
  paymentMethod?: string
): Promise<Order> {
  const items = cart.items.map((item) => ({
    productName: formatProductName(item),
    quantity: item.quantity,
    unitPrice: calculateItemUnitPrice(item),
    notes: item.notes,
  }))

  return createOrder({
    tenantId: cart.establishmentId,
    customerName,
    customerPhone,
    customerAddress,
    items,
    total: cart.total,
    notes,
    paymentMethod,
  })
}

// TASK-013: Get order by order number
export async function getOrderByNumber(
  tenantId: string,
  orderNumber: string
): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("order_number", orderNumber)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Not found
    }
    console.error("Error fetching order by number:", error)
    throw new Error("Falha ao buscar pedido")
  }

  return data
}

// AIDEV-NOTE: Get order by ID
export async function getOrderById(
  tenantId: string,
  orderId: string
): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", orderId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Not found
    }
    console.error("Error fetching order by ID:", error)
    throw new Error("Falha ao buscar pedido")
  }

  return data
}

// AIDEV-NOTE: Get order with items
export async function getOrderWithItems(
  tenantId: string,
  orderId: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const order = await getOrderById(tenantId, orderId)
  if (!order) return null

  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

  if (error) {
    console.error("Error fetching order items:", error)
    return { order, items: [] }
  }

  return { order, items: items || [] }
}

// AIDEV-NOTE: Get orders by customer phone
export async function getOrdersByPhone(
  tenantId: string,
  phone: string,
  limit: number = 5
): Promise<Order[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching orders by phone:", error)
    throw new Error("Falha ao buscar pedidos")
  }

  return data || []
}

// TASK-014: Find or create customer by phone
// AIDEV-NOTE: This is a simplified version - in production you might have a customers table
export async function findOrCreateCustomer(
  tenantId: string,
  phone: string,
  name: string
): Promise<CustomerData> {
  const supabase = await createClient()

  // Try to find an existing order with this phone to get customer info
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("customer_name, customer_phone, created_at")
    .eq("tenant_id", tenantId)
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (existingOrder) {
    // Customer exists - return their info
    return {
      id: generateCustomerId(tenantId, phone),
      name: existingOrder.customer_name || name,
      phone: phone,
      createdAt: new Date(existingOrder.created_at),
    }
  }

  // New customer
  return {
    id: generateCustomerId(tenantId, phone),
    name: name,
    phone: phone,
    createdAt: new Date(),
  }
}

// AIDEV-NOTE: Get customer's last order
export async function getLastOrder(
  tenantId: string,
  phone: string
): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching last order:", error)
    return null
  }

  return data
}

// AIDEV-NOTE: Format order status for AI response
export function formatOrderStatus(order: Order): string {
  const statusMessages: Record<string, string> = {
    pending: "Pedido recebido, aguardando confirmacao",
    confirmed: "Pedido confirmado",
    preparing: "Pedido em preparacao",
    ready: "Pedido pronto para entrega/retirada",
    out_for_delivery: "Pedido saiu para entrega",
    delivered: "Pedido entregue",
    cancelled: "Pedido cancelado",
  }

  const status = statusMessages[order.status] || order.status

  return `Pedido #${order.order_number}: ${status}`
}

// AIDEV-NOTE: Format order summary for AI response
export function formatOrderSummary(order: Order, items: OrderItem[]): string {
  const lines: string[] = [
    `Pedido #${order.order_number}`,
    `Status: ${formatOrderStatus(order)}`,
    `Cliente: ${order.customer_name}`,
    "",
    "Itens:",
  ]

  items.forEach((item) => {
    let line = `- ${item.product_name} x${item.quantity} - R$ ${(item.unit_price * item.quantity).toFixed(2)}`
    if (item.notes) {
      line += ` (${item.notes})`
    }
    lines.push(line)
  })

  lines.push("")
  lines.push(`Total: R$ ${order.total.toFixed(2)}`)

  if (order.notes) {
    lines.push(`Observacoes: ${order.notes}`)
  }

  return lines.join("\n")
}

// ==================== HELPER FUNCTIONS ====================

// AIDEV-NOTE: Generate unique order number
function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, "")
  const time = now.getTime().toString().slice(-6)
  return `${date}-${time}`
}

// AIDEV-NOTE: Generate customer ID from tenant and phone
function generateCustomerId(tenantId: string, phone: string): string {
  // Simple hash-like ID based on tenant and phone
  return `${tenantId.slice(0, 8)}-${phone.replace(/\D/g, "").slice(-8)}`
}

// AIDEV-NOTE: Format product name including variation
function formatProductName(item: CartItem): string {
  let name = item.productName
  if (item.variationName) {
    name += ` (${item.variationName})`
  }
  if (item.addons && item.addons.length > 0) {
    const addonNames = item.addons.map((a) => a.addonName).join(", ")
    name += ` + ${addonNames}`
  }
  return name
}

// AIDEV-NOTE: Calculate unit price including variation modifier
function calculateItemUnitPrice(item: CartItem): number {
  let price = item.basePrice + (item.variationPriceModifier || 0)
  if (item.addons) {
    const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.subtotal, 0)
    price += addonsTotal / item.quantity // Distribute addons across quantity
  }
  return price
}

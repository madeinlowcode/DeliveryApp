// TASK-007 to TASK-011: AI Menu service for the AI agent
// AIDEV-NOTE: Service layer for AI agent menu operations - used by AI tools to query menu data

import { createClient } from "@/lib/supabase/server"
import type {
  Category,
  Product,
  ProductWithRelations,
} from "@/types/database"
import type { BusinessHoursInput, BusinessHour } from "@/lib/validators/settings"
import { defaultBusinessHours } from "@/lib/validators/settings"

// AIDEV-NOTE: AI Menu service with server-side Supabase client
// This service is used by AI tools to fetch menu data

// TASK-007: Get active categories for a tenant
export async function getActiveCategories(tenantId: string): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories for AI:", error)
    throw new Error("Falha ao buscar categorias")
  }

  return data || []
}

// TASK-008: Get products by category for a tenant
export async function getProductsByCategory(
  tenantId: string,
  categoryId: string
): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("category_id", categoryId)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching products for AI:", error)
    throw new Error("Falha ao buscar produtos")
  }

  return data || []
}

// AIDEV-NOTE: Get all available products for a tenant (no category filter)
export async function getAllProducts(tenantId: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching all products for AI:", error)
    throw new Error("Falha ao buscar produtos")
  }

  return data || []
}

// TASK-009: Get product by ID with variations and addons
export async function getProductById(
  tenantId: string,
  productId: string
): Promise<ProductWithRelations | null> {
  const supabase = await createClient()

  // Fetch product with establishment validation
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("tenant_id", tenantId)
    .single()

  if (productError) {
    if (productError.code === "PGRST116") {
      return null // Not found
    }
    console.error("Error fetching product for AI:", productError)
    throw new Error("Falha ao buscar produto")
  }

  // Fetch variations
  const { data: variations } = await supabase
    .from("product_variations")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  // Fetch addons
  const { data: addons } = await supabase
    .from("product_addons")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("name", { ascending: true })

  // Fetch category if exists
  let category = undefined
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .single()

    category = categoryData || undefined
  }

  return {
    ...product,
    category,
    variations: variations || [],
    addons: addons || [],
  }
}

// AIDEV-NOTE: Search products by name for AI queries
export async function searchProducts(
  tenantId: string,
  query: string
): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_available", true)
    .ilike("name", `%${query}%`)
    .order("sort_order", { ascending: true })
    .limit(10)

  if (error) {
    console.error("Error searching products for AI:", error)
    throw new Error("Falha ao buscar produtos")
  }

  return data || []
}

// TASK-010: Check if business is currently open
export async function isBusinessOpen(tenantId: string): Promise<boolean> {
  const businessHours = await getBusinessHours(tenantId)
  return checkIfOpen(businessHours)
}

// TASK-011: Get business hours message for the AI to inform customers
export async function getBusinessHoursMessage(tenantId: string): Promise<string> {
  const businessHours = await getBusinessHours(tenantId)
  const isOpen = checkIfOpen(businessHours)

  if (isOpen) {
    return formatOpenMessage(businessHours)
  } else {
    return formatClosedMessage(businessHours)
  }
}

// AIDEV-NOTE: Helper function to get business hours for a tenant
async function getBusinessHours(tenantId: string): Promise<BusinessHoursInput> {
  // AIDEV-NOTE: For now, using default business hours
  // In production, this would fetch from the database or settings table
  // The settings service stores in localStorage which is client-side only
  // Server-side would need a proper database column

  // Try to fetch from establishment metadata if available
  const supabase = await createClient()

  const { data: establishment } = await supabase
    .from("establishments")
    .select("*")
    .eq("id", tenantId)
    .single()

  // AIDEV-TODO: When business_hours column is added to establishments table,
  // parse it here: return establishment?.business_hours ?? defaultBusinessHours

  return defaultBusinessHours
}

// AIDEV-NOTE: Helper to check if currently open based on business hours
function checkIfOpen(businessHours: BusinessHoursInput): boolean {
  const now = new Date()
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const

  const today = days[now.getDay()]
  const todayHours = businessHours[today] as BusinessHour

  if (!todayHours.is_open) {
    return false
  }

  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  return currentTime >= todayHours.open && currentTime <= todayHours.close
}

// AIDEV-NOTE: Format message when business is open
function formatOpenMessage(businessHours: BusinessHoursInput): string {
  const now = new Date()
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const

  const today = days[now.getDay()]
  const todayHours = businessHours[today] as BusinessHour

  return `Estamos abertos! Hoje funcionamos das ${todayHours.open} as ${todayHours.close}.`
}

// AIDEV-NOTE: Format message when business is closed
function formatClosedMessage(businessHours: BusinessHoursInput): string {
  const now = new Date()
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const

  const dayNames: Record<string, string> = {
    sunday: "Domingo",
    monday: "Segunda-feira",
    tuesday: "Terca-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sabado",
  }

  const today = days[now.getDay()]
  const todayHours = businessHours[today] as BusinessHour

  // Find next open day
  let nextOpenDay: string | null = null
  let nextOpenHours: BusinessHour | null = null

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (now.getDay() + i) % 7
    const nextDay = days[nextDayIndex]
    const hours = businessHours[nextDay] as BusinessHour

    if (hours.is_open) {
      nextOpenDay = nextDay
      nextOpenHours = hours
      break
    }
  }

  let message = "Estamos fechados no momento."

  if (!todayHours.is_open) {
    message += ` Nao abrimos ${dayNames[today].toLowerCase()}.`
  } else {
    message += ` Hoje abrimos das ${todayHours.open} as ${todayHours.close}.`
  }

  if (nextOpenDay && nextOpenHours) {
    if (nextOpenDay === days[(now.getDay() + 1) % 7]) {
      message += ` Abriremos amanha as ${nextOpenHours.open}.`
    } else {
      message += ` Abriremos ${dayNames[nextOpenDay].toLowerCase()} as ${nextOpenHours.open}.`
    }
  }

  return message
}

// AIDEV-NOTE: Get full menu for AI context (categories with products)
export async function getFullMenu(tenantId: string): Promise<
  Array<{
    category: Category
    products: Product[]
  }>
> {
  const categories = await getActiveCategories(tenantId)
  const menu: Array<{ category: Category; products: Product[] }> = []

  for (const category of categories) {
    const products = await getProductsByCategory(tenantId, category.id)
    menu.push({ category, products })
  }

  return menu
}

// AIDEV-NOTE: Format menu as text for AI system prompt
export async function formatMenuForAI(tenantId: string): Promise<string> {
  const menu = await getFullMenu(tenantId)

  if (menu.length === 0) {
    return "O cardapio esta vazio no momento."
  }

  const lines: string[] = ["CARDAPIO:"]

  for (const { category, products } of menu) {
    lines.push("")
    lines.push(`## ${category.name}`)
    if (category.description) {
      lines.push(category.description)
    }

    for (const product of products) {
      let productLine = `- ${product.name}: R$ ${product.price.toFixed(2)}`
      if (product.description) {
        productLine += ` (${product.description})`
      }
      lines.push(productLine)
    }
  }

  return lines.join("\n")
}

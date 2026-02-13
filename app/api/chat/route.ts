// TASK-041 to TASK-044: Chat API Route with streamText
// AIDEV-NOTE: Main API endpoint for AI agent chat with tool calling

import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { openrouter, DEFAULT_MODEL } from '@/lib/ai/provider'
import { generateSystemPrompt, establishmentToTenant } from '@/lib/ai/system-prompt'
import type { Tenant, BusinessHours as TenantBusinessHours } from '@/types/cart'
import { withRateLimit } from '@/lib/api-middleware'
import {
  createGetCategoriesTool,
  createGetProductsTool,
  createCheckHoursTool,
  createAddToCartTool,
  createRemoveFromCartTool,
  createGetCartTool,
  createCheckoutTool,
  createGetOrderStatusTool,
  type CheckoutContext,
} from './tools'

// AIDEV-NOTE: Request body structure
interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  tenantSlug: string
  sessionId: string
}

// AIDEV-NOTE: TASK-042 - Get tenant by slug from database
// AIDEV-NOTE: TASK-005 - Fetch settings from tenants and business_hours tables
async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()

    // AIDEV-NOTE: Fetch tenant from tenants table (includes delivery_fee, min_order_value)
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !tenant) {
      console.error('[getTenantBySlug] Error or not found:', error)
      return null
    }

    // AIDEV-NOTE: Fetch business hours for the tenant
    const { data: businessHoursData, error: _bhError } = await supabase
      .from('business_hours')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('is_closed', false)
      .order('day_of_week', { ascending: true })

    // AIDEV-NOTE: Convert to BusinessHours format for the AI system prompt
    // Convert from database format (day_of_week 0-6, opens_at, closes_at) to Tenant format (monday-sunday)
    const dayNames = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ] as const
    const businessHours: TenantBusinessHours = {}

    businessHoursData?.forEach((bh) => {
      const dayName = dayNames[bh.day_of_week] as keyof TenantBusinessHours
      if (dayName) {
        businessHours[dayName] = {
          open: bh.opens_at.slice(0, 5), // Convert "HH:MM:SS" to "HH:MM"
          close: bh.closes_at.slice(0, 5),
          isClosed: bh.is_closed,
        }
      }
    })

    // AIDEV-NOTE: Convert to Tenant format using the helper function
    // delivery_fee and min_order_value come from tenants table
    const tenantData = establishmentToTenant(tenant, {
      businessHours: Object.keys(businessHours).length > 0 ? businessHours : undefined,
      deliveryFee: tenant.delivery_fee ?? 5.0, // Default if null
      minimumOrder: tenant.min_order_value ?? 20.0, // Default if null
    })

    return tenantData
  } catch (error) {
    console.error('[getTenantBySlug] Exception:', error)
    return null
  }
}

// AIDEV-NOTE: Create all tools with context
function createTools(context: CheckoutContext) {
  return {
    getCategories: createGetCategoriesTool(context),
    getProducts: createGetProductsTool(context),
    checkHours: createCheckHoursTool(context),
    addToCart: createAddToCartTool(context),
    removeFromCart: createRemoveFromCartTool(context),
    getCart: createGetCartTool(context),
    checkout: createCheckoutTool(context),
    getOrderStatus: createGetOrderStatusTool(context),
  }
}

// AIDEV-NOTE: Main POST handler
export async function POST(request: Request) {
  try {
    // AIDEV-NOTE: Parse request body first to get identifiers for rate limiting
    const body = (await request.json()) as ChatRequest
    const { messages, tenantSlug, sessionId } = body

    // AIDEV-SECURITY: Apply rate limiting using sessionId and tenantSlug as identifier
    // AIDEV-NOTE: More strict limit for chat (20 req/min) to prevent abuse
    const rateLimitId = `chat:${tenantSlug || 'global'}:${sessionId || 'anonymous'}`
    const { allowed, headers: rateLimitHeaders } = await withRateLimit(rateLimitId, 20)

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...rateLimitHeaders } }
      )
    }

    // AIDEV-NOTE: Validate required fields
    if (!tenantSlug || !sessionId) {
      return new Response(JSON.stringify({ error: 'tenantSlug and sessionId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // AIDEV-NOTE: TASK-042 - Fetch tenant configuration
    const tenant = await getTenantBySlug(tenantSlug)

    if (!tenant) {
      return new Response(JSON.stringify({ error: 'Establishment not found or inactive' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // AIDEV-NOTE: Generate system prompt with tenant info
    const systemPrompt = generateSystemPrompt(tenant)

    // AIDEV-NOTE: Create tool execution context
    // AIDEV-NOTE: T-009 FIX - Include minimumOrder from tenant for checkout validation
    const toolContext: CheckoutContext = {
      tenantId: tenant.id,
      sessionId,
      businessHours: tenant.businessHours,
      minimumOrder: tenant.minimumOrder,
    }

    // AIDEV-NOTE: Create all tools with context injected
    const tools = createTools(toolContext)

    // AIDEV-NOTE: TASK-043, TASK-044 - Stream text with OpenRouter and tools
    const result = streamText({
      model: openrouter(DEFAULT_MODEL),
      system: systemPrompt,
      messages,
      tools,
      toolChoice: 'auto',
    })

    // AIDEV-NOTE: Return streaming response
    // TASK-044: maxSteps - AI SDK v6 uses agent-based approach for multi-step
    // We can wrap this in an agent in the future if multi-step is needed
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[Chat API] Error:', error)

    // AIDEV-NOTE: Handle specific error types
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// AIDEV-NOTE: OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

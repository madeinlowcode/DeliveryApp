// TASK-081: Orders API route (PATCH by ID)
// AIDEV-NOTE: API endpoint for updating order status

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatusSchema, orderIdSchema } from '@/lib/validators/order'
import { canTransitionTo } from '@/types/order'
import { withRateLimit } from '@/lib/api-middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// AIDEV-NOTE: PATCH /api/orders/[id] - Update order status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // AIDEV-SECURITY: Apply rate limiting
    const { allowed, headers: rateLimitHeaders } = await withRateLimit(`orders:update`, 30)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      )
    }

    const supabase = await createClient()
    const { id } = await params

    // AIDEV-NOTE: Validate order ID
    const idResult = orderIdSchema.safeParse({ id })
    if (!idResult.success) {
      return NextResponse.json({ error: 'ID do pedido invalido' }, { status: 400 })
    }

    // AIDEV-NOTE: Parse and validate request body
    const body = await request.json()
    const parseResult = updateOrderStatusSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { status: newStatus, notes } = parseResult.data

    // AIDEV-NOTE: Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    // AIDEV-NOTE: Get user's establishment
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.tenant_id) {
      return NextResponse.json({ error: 'Usuario sem estabelecimento vinculado' }, { status: 403 })
    }

    // AIDEV-NOTE: Get current order to validate ownership and status transition
    const { data: currentOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !currentOrder) {
      return NextResponse.json({ error: 'Pedido nao encontrado' }, { status: 404 })
    }

    // AIDEV-NOTE: Verify order belongs to user's establishment
    if (currentOrder.tenant_id !== userData.tenant_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // AIDEV-NOTE: Validate status transition
    if (!canTransitionTo(currentOrder.status, newStatus)) {
      return NextResponse.json(
        {
          error: `Transicao de status invalida: ${currentOrder.status} -> ${newStatus}`,
        },
        { status: 400 }
      )
    }

    // AIDEV-NOTE: Update order status
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedOrder,
      message: `Status atualizado para ${newStatus}`,
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// AIDEV-NOTE: GET /api/orders/[id] - Get single order with items
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // AIDEV-NOTE: Validate order ID
    const idResult = orderIdSchema.safeParse({ id })
    if (!idResult.success) {
      return NextResponse.json({ error: 'ID do pedido invalido' }, { status: 400 })
    }

    // AIDEV-NOTE: Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    // AIDEV-NOTE: Get user's establishment
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.tenant_id) {
      return NextResponse.json({ error: 'Usuario sem estabelecimento vinculado' }, { status: 403 })
    }

    // AIDEV-NOTE: Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items(*)
      `
      )
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido nao encontrado' }, { status: 404 })
    }

    // AIDEV-NOTE: Verify order belongs to user's tenant
    if (order.tenant_id !== userData.tenant_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('Unexpected error in GET /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

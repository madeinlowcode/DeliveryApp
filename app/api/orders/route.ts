// TASK-081: Orders API route (GET)
// AIDEV-NOTE: API endpoint for fetching orders list

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { orderQuerySchema } from "@/lib/validators/order"

// AIDEV-NOTE: GET /api/orders - Fetch orders for the establishment
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // AIDEV-NOTE: Parse and validate query parameters
    const queryParams = {
      status: searchParams.get("status") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    }

    const parseResult = orderQuerySchema.safeParse(queryParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Parametros invalidos", details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const query = parseResult.data

    // AIDEV-NOTE: Get current user to determine establishment
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nao autenticado" },
        { status: 401 }
      )
    }

    // AIDEV-NOTE: Get user's establishment
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.tenant_id) {
      return NextResponse.json(
        { error: "Usuario sem estabelecimento vinculado" },
        { status: 403 }
      )
    }

    // AIDEV-NOTE: Build query with filters
    let ordersQuery = supabase
      .from("orders")
      .select(`
        *,
        order_items(id, product_name, quantity, unit_price, notes)
      `)
      .eq("tenant_id", userData.tenant_id)
      .order("created_at", { ascending: false })

    // Apply status filter
    if (query.status) {
      ordersQuery = ordersQuery.eq("status", query.status)
    }

    // Apply date filters
    if (query.date_from) {
      ordersQuery = ordersQuery.gte("created_at", query.date_from)
    }

    if (query.date_to) {
      ordersQuery = ordersQuery.lte("created_at", query.date_to)
    }

    // Apply pagination
    const limit = query.limit ?? 50
    const offset = query.offset ?? 0
    ordersQuery = ordersQuery.range(offset, offset + limit - 1)

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json(
        { error: "Erro ao buscar pedidos" },
        { status: 500 }
      )
    }

    // AIDEV-NOTE: Get total count for pagination
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", userData.tenant_id)

    return NextResponse.json({
      data: orders,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error("Unexpected error in GET /api/orders:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

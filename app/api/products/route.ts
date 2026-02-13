// TASK-083: Products API route (GET, POST)
// AIDEV-NOTE: API endpoints for fetching and creating products

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProductSchema, productQuerySchema } from '@/lib/validators/product'
import { withRateLimit } from '@/lib/api-middleware'

// AIDEV-NOTE: GET /api/products - Fetch all products for the establishment
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // AIDEV-NOTE: Parse and validate query parameters
    const queryParams = {
      category_id: searchParams.get('category_id') || undefined,
      is_available: searchParams.get('is_available') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    }

    const parseResult = productQuerySchema.safeParse(queryParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Parametros invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const query = parseResult.data

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

    // AIDEV-NOTE: Build query with filters
    let productsQuery = supabase
      .from('products')
      .select(
        `
        *,
        category:categories(id, name)
      `
      )
      .eq('tenant_id', userData.tenant_id)
      .order('name', { ascending: true })

    // Apply category filter
    if (query.category_id) {
      productsQuery = productsQuery.eq('category_id', query.category_id)
    }

    // Apply availability filter
    if (query.is_available !== undefined) {
      productsQuery = productsQuery.eq('is_available', query.is_available)
    }

    // Apply search filter
    if (query.search) {
      productsQuery = productsQuery.ilike('name', `%${query.search}%`)
    }

    // Apply pagination
    const limit = query.limit ?? 50
    const offset = query.offset ?? 0
    productsQuery = productsQuery.range(offset, offset + limit - 1)

    const { data: products, error: productsError } = await productsQuery

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    // AIDEV-NOTE: Get total count for pagination
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', userData.tenant_id)

    return NextResponse.json({
      data: products,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/products:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// AIDEV-NOTE: POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    // AIDEV-SECURITY: Apply rate limiting
    const { allowed, headers: rateLimitHeaders } = await withRateLimit(`products:create`, 30)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      )
    }

    const supabase = await createClient()

    // AIDEV-NOTE: Parse and validate request body
    const body = await request.json()
    const parseResult = createProductSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const productData = parseResult.data

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

    // AIDEV-NOTE: Verify the product is being created for the user's establishment
    if (productData.tenant_id !== userData.tenant_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // AIDEV-NOTE: If category_id is provided, verify it belongs to the establishment
    if (productData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, tenant_id')
        .eq('id', productData.category_id)
        .single()

      if (categoryError || !category) {
        return NextResponse.json({ error: 'Categoria nao encontrada' }, { status: 400 })
      }

      if (category.tenant_id !== userData.tenant_id) {
        return NextResponse.json(
          { error: 'Categoria pertence a outro estabelecimento' },
          { status: 403 }
        )
      }
    }

    // AIDEV-NOTE: Create the product
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating product:', createError)
      return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
    }

    return NextResponse.json(
      { data: newProduct, message: 'Produto criado com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/products:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

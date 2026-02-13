// TASK-082: Categories API route (GET, POST)
// AIDEV-NOTE: API endpoints for fetching and creating categories

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCategorySchema } from '@/lib/validators/category'
import { withRateLimit } from '@/lib/api-middleware'

// AIDEV-NOTE: GET /api/categories - Fetch all categories for the establishment
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

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

    // AIDEV-NOTE: Fetch categories ordered by sort_order
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error('Unexpected error in GET /api/categories:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// AIDEV-NOTE: POST /api/categories - Create a new category
export async function POST(request: Request) {
  try {
    // AIDEV-SECURITY: Apply rate limiting
    const { allowed, headers: rateLimitHeaders } = await withRateLimit(`categories:create`, 30)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      )
    }

    const supabase = await createClient()

    // AIDEV-NOTE: Parse and validate request body
    const body = await request.json()
    const parseResult = createCategorySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const categoryData = parseResult.data

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

    // AIDEV-NOTE: Verify the category is being created for the user's establishment
    if (categoryData.tenant_id !== userData.tenant_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // AIDEV-NOTE: Get the highest sort_order to place new category at the end
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('sort_order')
      .eq('tenant_id', userData.tenant_id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (existingCategories?.[0]?.sort_order ?? -1) + 1

    // AIDEV-NOTE: Create the category
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        sort_order: categoryData.sort_order ?? nextSortOrder,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating category:', createError)
      return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
    }

    return NextResponse.json(
      { data: newCategory, message: 'Categoria criada com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/categories:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

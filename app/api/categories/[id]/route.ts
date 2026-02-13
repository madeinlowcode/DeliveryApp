// TASK-082: Categories API route (PATCH, DELETE by ID)
// AIDEV-NOTE: API endpoints for updating and deleting categories

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateCategorySchema, categoryIdSchema } from "@/lib/validators/category"

interface RouteParams {
  params: Promise<{ id: string }>
}

// AIDEV-NOTE: GET /api/categories/[id] - Get single category
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // AIDEV-NOTE: Validate category ID
    const idResult = categoryIdSchema.safeParse({ id })
    if (!idResult.success) {
      return NextResponse.json(
        { error: "ID da categoria invalido" },
        { status: 400 }
      )
    }

    // AIDEV-NOTE: Get current user
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

    // AIDEV-NOTE: Fetch category
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Categoria nao encontrada" },
        { status: 404 }
      )
    }

    // AIDEV-NOTE: Verify category belongs to user's establishment
    if (category.tenant_id !== userData.tenant_id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error("Unexpected error in GET /api/categories/[id]:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// AIDEV-NOTE: PATCH /api/categories/[id] - Update category
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // AIDEV-NOTE: Validate category ID
    const idResult = categoryIdSchema.safeParse({ id })
    if (!idResult.success) {
      return NextResponse.json(
        { error: "ID da categoria invalido" },
        { status: 400 }
      )
    }

    // AIDEV-NOTE: Parse and validate request body
    const body = await request.json()
    const parseResult = updateCategorySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const updateData = parseResult.data

    // AIDEV-NOTE: Get current user
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

    // AIDEV-NOTE: Verify category exists and belongs to user's establishment
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: "Categoria nao encontrada" },
        { status: 404 }
      )
    }

    if (existingCategory.tenant_id !== userData.tenant_id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // AIDEV-NOTE: Update category
    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating category:", updateError)
      return NextResponse.json(
        { error: "Erro ao atualizar categoria" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedCategory,
      message: "Categoria atualizada com sucesso",
    })
  } catch (error) {
    console.error("Unexpected error in PATCH /api/categories/[id]:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// AIDEV-NOTE: DELETE /api/categories/[id] - Delete category
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // AIDEV-NOTE: Validate category ID
    const idResult = categoryIdSchema.safeParse({ id })
    if (!idResult.success) {
      return NextResponse.json(
        { error: "ID da categoria invalido" },
        { status: 400 }
      )
    }

    // AIDEV-NOTE: Get current user
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

    // AIDEV-NOTE: Verify category exists and belongs to user's establishment
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: "Categoria nao encontrada" },
        { status: 404 }
      )
    }

    if (existingCategory.tenant_id !== userData.tenant_id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // AIDEV-NOTE: Check if category has products
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id)

    if (productCount && productCount > 0) {
      return NextResponse.json(
        {
          error: `Nao e possivel excluir categoria com ${productCount} produto(s) vinculado(s)`,
        },
        { status: 400 }
      )
    }

    // AIDEV-NOTE: Delete category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting category:", deleteError)
      return NextResponse.json(
        { error: "Erro ao excluir categoria" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Categoria excluida com sucesso",
    })
  } catch (error) {
    console.error("Unexpected error in DELETE /api/categories/[id]:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// TASK-086: Upload signed URL API route
// AIDEV-NOTE: API endpoint for generating Supabase Storage signed upload URLs

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signedUrlRequestSchema, maxFileSizes } from '@/lib/validators/upload'
import { withRateLimit } from '@/lib/api-middleware'

// AIDEV-NOTE: POST /api/upload/signed-url - Generate signed URL for file upload
export async function POST(request: Request) {
  try {
    // AIDEV-SECURITY: Apply rate limiting (stricter for uploads)
    const { allowed, headers: rateLimitHeaders } = await withRateLimit(`upload:signed-url`, 10)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      )
    }

    const supabase = await createClient()

    // AIDEV-NOTE: Parse and validate request body
    const body = await request.json()
    const parseResult = signedUrlRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { filename, contentType, folder } = parseResult.data

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

    // AIDEV-NOTE: Generate unique file path with establishment ID for isolation
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${userData.tenant_id}/${folder}/${timestamp}_${sanitizedFilename}`

    // AIDEV-NOTE: Create signed upload URL
    // The bucket name should be configured in Supabase Storage
    const bucketName = 'uploads'

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath)

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError)
      return NextResponse.json({ error: 'Erro ao gerar URL de upload' }, { status: 500 })
    }

    // AIDEV-NOTE: Get the public URL for after upload
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      token: signedUrlData.token,
      path: filePath,
      publicUrl: publicUrlData.publicUrl,
      maxSize: maxFileSizes[folder],
      contentType,
      expiresIn: 3600, // 1 hour
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/upload/signed-url:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// AIDEV-NOTE: Server-side Supabase client for Server Components and Route Handlers
// Uses @supabase/ssr with Next.js cookies() for session management
// This client respects RLS policies and uses the anon key

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // AIDEV-NOTE: The `setAll` method was called from a Server Component
            // This can be ignored if you have middleware refreshing user sessions
          }
        },
      },
    }
  )
}

// AIDEV-NOTE: Helper to get the current user session
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// AIDEV-NOTE: Helper to get the current user
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// AIDEV-SECURITY: Admin client with service role key - BYPASSES RLS
// Only use in server-side code (API routes, server actions)
// NEVER import this file in client components

// AIDEV-NOTE: This client should only be used for:
// - Admin operations that need to bypass RLS
// - Cron jobs and background tasks
// - Server-side data seeding
// - Operations that need to access data across tenants

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// AIDEV-SECURITY: Validate that this is only called from server context
export function getAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in browser context')
  }
  return createAdminClient()
}

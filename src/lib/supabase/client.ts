'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// AIDEV-NOTE: Browser-side Supabase client for client components
// Uses @supabase/ssr for proper cookie handling in Next.js
// This client respects RLS policies and uses the anon key

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// AIDEV-NOTE: Singleton pattern for client-side usage
// Prevents multiple client instances in React components
let browserClient: ReturnType<typeof createClient> | null = null

export function getClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

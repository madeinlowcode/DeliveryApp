"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

// AIDEV-NOTE: Stub Supabase browser client - Agent 1 will complete with proper env vars
// This client is used for client-side operations (auth, realtime subscriptions)

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// AIDEV-NOTE: Singleton pattern for client-side to avoid multiple instances
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}

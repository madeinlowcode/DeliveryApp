// AIDEV-NOTE: Supabase client exports
// Re-exports all Supabase client utilities for easier imports

export { createClient, getClient } from './client'
export { createClient as createServerClient, getSession, getUser } from './server'
export { createAdminClient, getAdminClient } from './admin'

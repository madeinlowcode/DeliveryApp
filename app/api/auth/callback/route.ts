// TASK-045: Supabase Auth callback route
// AIDEV-NOTE: Handles OAuth and magic link callbacks from Supabase

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // AIDEV-NOTE: Get the authorization code from the callback
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()

    // AIDEV-NOTE: Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // AIDEV-NOTE: Successful authentication - redirect to intended destination
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        // Local development - redirect to origin
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Production with proxy/load balancer
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Production without proxy
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // AIDEV-NOTE: Log error for debugging
    console.error("Auth callback error:", error)
  }

  // AIDEV-NOTE: Return to login page with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

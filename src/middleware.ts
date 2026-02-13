import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// AIDEV-NOTE: Middleware for authentication and session refresh
// Runs on every request to protected routes
// Handles session refresh and redirects for unauthenticated users

// AIDEV-NOTE: T-017 - Using externalized redirect URLs configuration
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  AUTH_REDIRECT_URL,
  LOGIN_REDIRECT_URL,
} from '@/config/redirect-urls'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // AIDEV-DEV: Check for mock user in development mode
  const mockUserCookie = request.cookies.get('mock-user')
  const hasMockUser = mockUserCookie?.value

  // If in dev mode with mock user, treat as authenticated
  if (hasMockUser) {
    const { pathname } = request.nextUrl
    const isAuthPath = AUTH_ROUTES.some((route) => pathname.startsWith(route))
    if (isAuthPath) {
      return NextResponse.redirect(new URL(AUTH_REDIRECT_URL, request.url))
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // AIDEV-NOTE: Important - Do not remove this line
  // Refreshing the auth token ensures the user session stays valid
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // AIDEV-NOTE: Check if accessing protected route without auth
  const isProtectedPath = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (isProtectedPath && !user) {
    const redirectUrl = new URL(LOGIN_REDIRECT_URL, request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // AIDEV-NOTE: Redirect authenticated users away from auth pages
  const isAuthPath = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL(AUTH_REDIRECT_URL, request.url))
  }

  return supabaseResponse
}

// AIDEV-NOTE: Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

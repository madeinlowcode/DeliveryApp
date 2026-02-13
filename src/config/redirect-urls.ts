// AIDEV-NOTE: Externalized redirect URLs configuration for middleware
// AIDEV-NOTE: T-017 - Centralized redirect URL management

/**
 * Routes that require authentication
 * Users must be logged in to access these routes
 */
export const PROTECTED_ROUTES = [
  '/admin',
  '/profile',
  '/orders',
  '/checkout',
  '/dashboard',
  '/cardapio',
  '/configuracoes',
] as const

/**
 * Routes that should redirect authenticated users away
 * (e.g., login page should redirect to dashboard if already logged in)
 */
export const AUTH_ROUTES = ['/login', '/register'] as const

/**
 * Default redirect URL for authenticated users
 */
export const AUTH_REDIRECT_URL = '/admin/dashboard'

/**
 * Default redirect URL for unauthenticated users
 */
export const LOGIN_REDIRECT_URL = '/login'

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if a path is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route))
}

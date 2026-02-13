// AIDEV-SECURITY: XSS sanitization using DOMPurify
// Protects against Cross-Site Scripting (XSS) attacks

import DOMPurify from 'isomorphic-dompurify'

// AIDEV-SECURITY: Default configuration strips all HTML tags for plain text
const STRIP_ALL_CONFIG = { ALLOWED_TAGS: [] as string[], ALLOWED_ATTR: [] as string[] }

// AIDEV-SECURITY: Safe HTML configuration allows basic formatting only
const SAFE_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
}

/**
 * Sanitizes a string input by removing all HTML tags
 * Use for plain text inputs like names, addresses, etc.
 * @param input - The string to sanitize
 * @returns Sanitized string with all HTML stripped
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return DOMPurify.sanitize(input, STRIP_ALL_CONFIG).trim()
}

/**
 * Sanitizes HTML content while allowing safe formatting tags
 * Use for rich text content that needs to preserve formatting
 * @param input - The HTML string to sanitize
 * @returns Sanitized HTML with only safe tags
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return DOMPurify.sanitize(input, SAFE_HTML_CONFIG)
}

/**
 * Recursively sanitizes all string values in an object
 * Handles nested objects and arrays
 * @param obj - The object to sanitize
 * @returns New object with all string values sanitized
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle primitive types
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as T
  }

  if (typeof obj !== 'object') {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T
  }

  // Handle Date objects - preserve as-is
  if (obj instanceof Date) {
    return obj
  }

  // Handle plain objects
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    sanitized[key] = sanitizeObject(value)
  }

  return sanitized as T
}

/**
 * Sanitizes specific fields in an object
 * More performant when you know which fields need sanitization
 * @param obj - The object to partially sanitize
 * @param fields - Array of field names to sanitize
 * @returns New object with specified fields sanitized
 */
export function sanitizeFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const result = { ...obj }
  for (const field of fields) {
    const value = result[field]
    if (typeof value === 'string') {
      result[field] = sanitizeInput(value) as T[keyof T]
    }
  }

  return result
}

/**
 * Escapes HTML special characters for safe display
 * Use when you need to display user input as literal text
 * @param input - The string to escape
 * @returns String with HTML entities escaped
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return input.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char)
}

/**
 * Sanitizes a URL to prevent javascript: and data: protocols
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if unsafe
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }

  const trimmed = url.trim().toLowerCase()

  // AIDEV-SECURITY: Block dangerous URL protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return ''
    }
  }

  // Allow relative URLs and safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  const hasProtocol = trimmed.includes(':')

  if (hasProtocol && !safeProtocols.some((p) => trimmed.startsWith(p))) {
    // Unknown protocol - return empty for safety
    return ''
  }

  return url.trim()
}

/**
 * Sanitizes a filename to prevent path traversal attacks
 * @param filename - The filename to sanitize
 * @returns Safe filename without path traversal characters
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return ''
  }

  // AIDEV-SECURITY: Remove path traversal attempts and dangerous characters
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[/\\:*?"<>|]/g, '') // Remove dangerous characters
    .trim()
}

// TASK-071: Sanitize user messages for chat/communication
// TASK-074: Validate tenant slug for URL safety

/**
 * Sanitizes user message for chat/communication
 * Allows safe formatting while preventing XSS
 * @param message - The user message to sanitize
 * @returns Sanitized message safe for display
 */
export function sanitizeUserMessage(message: string): string {
  if (typeof message !== 'string') {
    return ''
  }

  // Use strip all config for maximum security in user messages
  return sanitizeInput(message)
}

/**
 * Validates if a tenant slug is safe for URLs
 * Ensures slug contains only URL-safe characters
 * @param slug - The tenant slug to validate
 * @returns True if slug is valid and safe
 */
export function isValidTenantSlug(slug: string): boolean {
  if (typeof slug !== 'string') {
    return false
  }

  // AIDEV-SECURITY: Tenant slug validation
  // Only allow lowercase letters, numbers, and hyphens
  // Must be between 2 and 50 characters
  // Cannot start or end with hyphen
  // Cannot have consecutive hyphens
  const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

  if (!slugRegex.test(slug)) {
    return false
  }

  if (slug.length < 2 || slug.length > 50) {
    return false
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    return false
  }

  return true
}

/**
 * Sanitizes and validates a tenant slug
 * @param slug - The tenant slug to sanitize
 * @returns Sanitized slug or empty string if invalid
 */
export function sanitizeTenantSlug(slug: string): string {
  if (typeof slug !== 'string') {
    return ''
  }

  // Convert to lowercase
  const sanitized = slug.toLowerCase()

  // Remove any characters that aren't URL-safe
  const cleaned = sanitized
    .replace(/[^a-z0-9-]/g, '') // Remove invalid chars
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

  // Validate result
  if (!isValidTenantSlug(cleaned)) {
    return ''
  }

  return cleaned
}

/**
 * Sanitizes a search query for safe use in API requests
 * @param query - The search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return ''
  }

  // Allow alphanumeric, spaces, and common search characters
  return query
    .replace(/[<>]/g, '') // Remove HTML brackets
    .trim()
    .slice(0, 500) // Limit length
}

/**
 * Validates and sanitizes a phone number
 * @param phone - The phone number to validate
 * @returns Sanitized phone number or empty string if invalid
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') {
    return ''
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')

  // Validate Brazilian phone number (10 or 11 digits)
  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    return ''
  }

  return digitsOnly
}

/**
 * Sanitizes email address for display/storage
 * @param email - The email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }

  const sanitized = email.trim().toLowerCase()

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    return ''
  }

  return sanitized
}

// AIDEV-SECURITY: Input validation utilities
// Protects against injection attacks by validating input formats

// UUID v4 regex pattern
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Generic UUID regex (supports v1-v5)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Email regex (RFC 5322 compliant simplified version)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone regex (international format)
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/

// Slug regex (URL-safe string)
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Validates if a string is a valid UUID v4
 * @param id - The string to validate
 * @returns true if valid UUID v4
 */
export function isValidUUID(id: unknown): id is string {
  if (typeof id !== 'string') {
    return false
  }
  return UUID_V4_REGEX.test(id)
}

/**
 * Validates if a string is a valid UUID (any version)
 * @param id - The string to validate
 * @returns true if valid UUID
 */
export function isValidUUIDAny(id: unknown): id is string {
  if (typeof id !== 'string') {
    return false
  }
  return UUID_REGEX.test(id)
}

/**
 * Validates if a string is a valid email address
 * @param email - The string to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') {
    return false
  }
  return EMAIL_REGEX.test(email) && email.length <= 254
}

/**
 * Validates if a string is a valid phone number
 * @param phone - The string to validate
 * @returns true if valid phone format
 */
export function isValidPhone(phone: unknown): phone is string {
  if (typeof phone !== 'string') {
    return false
  }
  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '')
  return PHONE_REGEX.test(cleaned)
}

/**
 * Validates if a string is a valid URL-safe slug
 * @param slug - The string to validate
 * @returns true if valid slug format
 */
export function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') {
    return false
  }
  return SLUG_REGEX.test(slug) && slug.length <= 200
}

/**
 * Validates if a value is a valid positive integer
 * @param value - The value to validate
 * @returns true if valid positive integer
 */
export function isValidPositiveInteger(value: unknown): value is number {
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return !isNaN(parsed) && parsed > 0 && parsed.toString() === value
  }
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/**
 * Validates if a value is a valid non-negative integer (including 0)
 * @param value - The value to validate
 * @returns true if valid non-negative integer
 */
export function isValidNonNegativeInteger(value: unknown): value is number {
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return !isNaN(parsed) && parsed >= 0 && parsed.toString() === value
  }
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

/**
 * Validates if a value is a valid price (positive number with up to 2 decimal places)
 * @param value - The value to validate
 * @returns true if valid price format
 */
export function isValidPrice(value: unknown): value is number {
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed < 0) return false
    // Check decimal places
    const parts = value.split('.')
    return parts.length <= 2 && (!parts[1] || parts[1].length <= 2)
  }
  return typeof value === 'number' && value >= 0 && Number.isFinite(value)
}

/**
 * Validates string length within bounds
 * @param value - The string to validate
 * @param min - Minimum length (inclusive)
 * @param max - Maximum length (inclusive)
 * @returns true if string length is within bounds
 */
export function isValidLength(
  value: unknown,
  min: number,
  max: number
): value is string {
  if (typeof value !== 'string') {
    return false
  }
  const trimmed = value.trim()
  return trimmed.length >= min && trimmed.length <= max
}

/**
 * Validates if a date string is in ISO 8601 format
 * @param dateString - The string to validate
 * @returns true if valid ISO date
 */
export function isValidISODate(dateString: unknown): dateString is string {
  if (typeof dateString !== 'string') {
    return false
  }
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && dateString.includes('T')
}

/**
 * Validates if a value is one of the allowed enum values
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @returns true if value is in allowed list
 */
export function isValidEnum<T>(value: unknown, allowedValues: readonly T[]): value is T {
  return allowedValues.includes(value as T)
}

/**
 * Validates an array of UUIDs
 * @param ids - The array to validate
 * @returns true if all items are valid UUIDs
 */
export function isValidUUIDArray(ids: unknown): ids is string[] {
  if (!Array.isArray(ids)) {
    return false
  }
  return ids.every(isValidUUID)
}

/**
 * Asserts that a value is a valid UUID, throws if invalid
 * @param id - The value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function assertValidUUID(id: unknown, fieldName = 'id'): asserts id is string {
  if (!isValidUUID(id)) {
    throw new Error(`Invalid ${fieldName}: must be a valid UUID`)
  }
}

/**
 * Asserts that a value is a valid email, throws if invalid
 * @param email - The value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function assertValidEmail(
  email: unknown,
  fieldName = 'email'
): asserts email is string {
  if (!isValidEmail(email)) {
    throw new Error(`Invalid ${fieldName}: must be a valid email address`)
  }
}

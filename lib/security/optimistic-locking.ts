// AIDEV-SECURITY: Optimistic locking implementation using updated_at field
// Prevents data loss from concurrent updates

/**
 * Error thrown when a version conflict is detected
 */
export class VersionConflictError extends Error {
  public readonly code = 'VERSION_CONFLICT'
  public readonly expectedVersion: string
  public readonly actualVersion: string

  constructor(expectedVersion: string, actualVersion: string) {
    super(
      `Version conflict: expected ${expectedVersion}, but found ${actualVersion}. ` +
      'The record has been modified by another user. Please refresh and try again.'
    )
    this.name = 'VersionConflictError'
    this.expectedVersion = expectedVersion
    this.actualVersion = actualVersion
  }
}

/**
 * Checks if the record version matches the expected version
 * @param expectedUpdatedAt - The updated_at timestamp the client has
 * @param actualUpdatedAt - The current updated_at timestamp from the database
 * @returns true if versions match
 */
export function checkVersion(
  expectedUpdatedAt: string | Date | null | undefined,
  actualUpdatedAt: string | Date | null | undefined
): boolean {
  // If no expected version provided, skip check (new record or first update)
  if (!expectedUpdatedAt) {
    return true
  }

  // If no actual version, something is wrong with the record
  if (!actualUpdatedAt) {
    return false
  }

  const expected = new Date(expectedUpdatedAt).getTime()
  const actual = new Date(actualUpdatedAt).getTime()

  return expected === actual
}

/**
 * Asserts that versions match, throws VersionConflictError if not
 * @param expectedUpdatedAt - The updated_at timestamp the client has
 * @param actualUpdatedAt - The current updated_at timestamp from the database
 * @throws VersionConflictError if versions don't match
 */
export function assertVersion(
  expectedUpdatedAt: string | Date | null | undefined,
  actualUpdatedAt: string | Date | null | undefined
): void {
  if (!checkVersion(expectedUpdatedAt, actualUpdatedAt)) {
    throw new VersionConflictError(
      expectedUpdatedAt?.toString() || 'null',
      actualUpdatedAt?.toString() || 'null'
    )
  }
}

/**
 * Generates a new timestamp for updated_at field
 * @returns ISO string timestamp
 */
export function generateNewVersion(): string {
  return new Date().toISOString()
}

/**
 * Prepares update data with optimistic locking
 * Adds new updated_at and validates existing version
 * @param updateData - The data to update
 * @param currentRecord - The current record from database
 * @returns Update data with new updated_at
 * @throws VersionConflictError if versions don't match
 */
export function prepareOptimisticUpdate<T extends { updated_at?: string | null }>(
  updateData: T,
  currentRecord: { updated_at?: string | null }
): T & { updated_at: string } {
  // Check version if client provided one
  assertVersion(updateData.updated_at, currentRecord.updated_at)

  // Return data with new version
  return {
    ...updateData,
    updated_at: generateNewVersion(),
  }
}

/**
 * SQL helper for Supabase/PostgreSQL optimistic locking
 * Returns the WHERE clause condition for version check
 * @param expectedUpdatedAt - The expected updated_at value
 * @returns Object for Supabase .eq() or .match() query
 */
export function getVersionWhereClause(
  expectedUpdatedAt: string | Date | null | undefined
): { updated_at: string } | Record<string, never> {
  if (!expectedUpdatedAt) {
    return {}
  }

  const timestamp = expectedUpdatedAt instanceof Date
    ? expectedUpdatedAt.toISOString()
    : expectedUpdatedAt

  return { updated_at: timestamp }
}

/**
 * Checks Supabase update result for version conflict
 * @param result - The result from Supabase update
 * @param expectedCount - Expected number of affected rows (usually 1)
 * @returns true if update was successful
 * @throws VersionConflictError if no rows were affected (version mismatch)
 */
export function checkUpdateResult(
  result: { count?: number | null; data?: unknown[] | null },
  expectedCount = 1
): boolean {
  const affectedCount = result.count ?? result.data?.length ?? 0

  if (affectedCount < expectedCount) {
    throw new VersionConflictError(
      'provided version',
      'current version'
    )
  }

  return true
}

/**
 * Type guard to check if an error is a VersionConflictError
 */
export function isVersionConflictError(error: unknown): error is VersionConflictError {
  return error instanceof VersionConflictError
}

/**
 * Creates a record with initial timestamps
 * @param data - The data for the new record
 * @returns Data with created_at and updated_at timestamps
 */
export function withTimestamps<T>(
  data: T
): T & { created_at: string; updated_at: string } {
  const now = generateNewVersion()
  return {
    ...data,
    created_at: now,
    updated_at: now,
  }
}

/**
 * Creates update data with new updated_at timestamp
 * @param data - The data to update
 * @returns Data with new updated_at timestamp
 */
export function withNewVersion<T>(data: T): T & { updated_at: string } {
  return {
    ...data,
    updated_at: generateNewVersion(),
  }
}

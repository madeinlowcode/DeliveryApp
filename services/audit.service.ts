// AIDEV-SECURITY: Audit logging service
// Provides comprehensive audit trail for all data modifications

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

// AIDEV-NOTE: Types for audit logging
export type AuditAction = 'create' | 'read' | 'update' | 'delete'

export interface AuditContext {
  tenantId: string
  userId?: string
  userEmail?: string
  userName?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

export interface AuditLogEntry {
  tenant_id: string
  user_id?: string
  user_email?: string
  user_name?: string
  entity_type: string
  entity_id: string
  action: AuditAction
  old_data?: Record<string, unknown> | null
  new_data?: Record<string, unknown> | null
  changes?: Record<string, { old: unknown; new: unknown }> | null
  ip_address?: string
  user_agent?: string
  request_id?: string
  metadata?: Record<string, unknown>
}

/**
 * Calculates the differences between two objects
 * @param oldData - The original data
 * @param newData - The updated data
 * @returns Object containing only the changed fields with old and new values
 */
export function calculateChanges(
  oldData: Record<string, unknown> | null | undefined,
  newData: Record<string, unknown> | null | undefined
): Record<string, { old: unknown; new: unknown }> | null {
  if (!oldData && !newData) {
    return null
  }

  if (!oldData) {
    // All fields are new
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    for (const [key, value] of Object.entries(newData || {})) {
      // Skip internal fields
      if (isInternalField(key)) continue
      changes[key] = { old: null, new: value }
    }
    return Object.keys(changes).length > 0 ? changes : null
  }

  if (!newData) {
    // All fields are removed
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    for (const [key, value] of Object.entries(oldData)) {
      if (isInternalField(key)) continue
      changes[key] = { old: value, new: null }
    }
    return Object.keys(changes).length > 0 ? changes : null
  }

  const changes: Record<string, { old: unknown; new: unknown }> = {}
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]))

  for (const key of allKeys) {
    // Skip internal/metadata fields that shouldn't be tracked
    if (isInternalField(key)) continue

    const oldValue = oldData[key]
    const newValue = newData[key]

    // Deep comparison for objects and arrays
    if (!deepEqual(oldValue, newValue)) {
      changes[key] = { old: oldValue, new: newValue }
    }
  }

  return Object.keys(changes).length > 0 ? changes : null
}

/**
 * Checks if a field is an internal field that shouldn't be tracked
 */
function isInternalField(key: string): boolean {
  const internalFields = [
    'created_at',
    'updated_at',
    'deleted_at',
    '__typename',
  ]
  return internalFields.includes(key)
}

/**
 * Deep equality check for comparing values
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a === null || b === null) return a === b
  if (a === undefined || b === undefined) return a === b

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)

    if (keysA.length !== keysB.length) return false

    return keysA.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    )
  }

  return false
}

/**
 * Creates an audit log entry
 * @param supabase - Supabase client instance
 * @param entry - The audit log entry to create
 */
export async function logAudit(
  supabase: SupabaseClient,
  entry: AuditLogEntry
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      tenant_id: entry.tenant_id,
      user_id: entry.user_id,
      user_email: entry.user_email,
      user_name: entry.user_name,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      action: entry.action,
      old_data: entry.old_data,
      new_data: entry.new_data,
      changes: entry.changes,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      request_id: entry.request_id,
      metadata: entry.metadata,
    })

    if (error) {
      console.error('[Audit] Failed to log audit entry:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Audit] Exception while logging:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Helper to log a CREATE operation
 */
export async function logCreate(
  supabase: SupabaseClient,
  context: AuditContext,
  entityType: string,
  entityId: string,
  newData: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  return logAudit(supabase, {
    tenant_id: context.tenantId,
    user_id: context.userId,
    user_email: context.userEmail,
    user_name: context.userName,
    entity_type: entityType,
    entity_id: entityId,
    action: 'create',
    old_data: null,
    new_data: newData,
    changes: calculateChanges(null, newData),
    ip_address: context.ipAddress,
    user_agent: context.userAgent,
    request_id: context.requestId,
    metadata: context.metadata,
  })
}

/**
 * Helper to log an UPDATE operation
 */
export async function logUpdate(
  supabase: SupabaseClient,
  context: AuditContext,
  entityType: string,
  entityId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  return logAudit(supabase, {
    tenant_id: context.tenantId,
    user_id: context.userId,
    user_email: context.userEmail,
    user_name: context.userName,
    entity_type: entityType,
    entity_id: entityId,
    action: 'update',
    old_data: oldData,
    new_data: newData,
    changes: calculateChanges(oldData, newData),
    ip_address: context.ipAddress,
    user_agent: context.userAgent,
    request_id: context.requestId,
    metadata: context.metadata,
  })
}

/**
 * Helper to log a DELETE operation
 */
export async function logDelete(
  supabase: SupabaseClient,
  context: AuditContext,
  entityType: string,
  entityId: string,
  oldData: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  return logAudit(supabase, {
    tenant_id: context.tenantId,
    user_id: context.userId,
    user_email: context.userEmail,
    user_name: context.userName,
    entity_type: entityType,
    entity_id: entityId,
    action: 'delete',
    old_data: oldData,
    new_data: null,
    changes: calculateChanges(oldData, null),
    ip_address: context.ipAddress,
    user_agent: context.userAgent,
    request_id: context.requestId,
    metadata: context.metadata,
  })
}

/**
 * Helper to log a READ operation (for sensitive data access tracking)
 */
export async function logRead(
  supabase: SupabaseClient,
  context: AuditContext,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  return logAudit(supabase, {
    tenant_id: context.tenantId,
    user_id: context.userId,
    user_email: context.userEmail,
    user_name: context.userName,
    entity_type: entityType,
    entity_id: entityId,
    action: 'read',
    old_data: null,
    new_data: null,
    changes: null,
    ip_address: context.ipAddress,
    user_agent: context.userAgent,
    request_id: context.requestId,
    metadata: { ...context.metadata, ...metadata },
  })
}

/**
 * Fetches audit logs for a specific entity
 */
export async function getEntityAuditLogs(
  supabase: SupabaseClient,
  tenantId: string,
  entityType: string,
  entityId: string,
  options?: {
    limit?: number
    offset?: number
  }
): Promise<{
  data: AuditLogEntry[] | null
  error?: string
  count?: number
}> {
  try {
    const query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query.limit(options.limit)
    }
    if (options?.offset) {
      query.range(options.offset, options.offset + (options.limit || 20) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as AuditLogEntry[], count: count || 0 }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { data: null, error: errorMessage }
  }
}

/**
 * Fetches audit logs for a tenant with filtering
 */
export async function getTenantAuditLogs(
  supabase: SupabaseClient,
  tenantId: string,
  options?: {
    entityType?: string
    action?: AuditAction
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }
): Promise<{
  data: AuditLogEntry[] | null
  error?: string
  count?: number
}> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (options?.entityType) {
      query = query.eq('entity_type', options.entityType)
    }
    if (options?.action) {
      query = query.eq('action', options.action)
    }
    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }
    if (options?.startDate) {
      query = query.gte('created_at', options.startDate.toISOString())
    }
    if (options?.endDate) {
      query = query.lte('created_at', options.endDate.toISOString())
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1
      )
    }

    const { data, error, count } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as AuditLogEntry[], count: count || 0 }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { data: null, error: errorMessage }
  }
}

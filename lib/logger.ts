// AIDEV-NOTE: Structured JSON logger for the application
// Provides consistent logging format for debugging and monitoring

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  /** Request ID for tracing */
  requestId?: string
  /** User ID if authenticated */
  userId?: string
  /** Tenant ID for multi-tenant context */
  tenantId?: string
  /** HTTP method */
  method?: string
  /** Request path */
  path?: string
  /** Response status code */
  statusCode?: number
  /** Duration in milliseconds */
  durationMs?: number
  /** Any additional context */
  [key: string]: unknown
}

export interface LogEntry {
  /** Log level */
  level: LogLevel
  /** Log message */
  message: string
  /** ISO timestamp */
  timestamp: string
  /** Service/component name */
  service: string
  /** Environment */
  environment: string
  /** Additional context */
  context?: LogContext
  /** Error details if present */
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

// Configuration
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
}

const DEFAULT_SERVICE = 'delivery-app'
const ENV = process.env.NODE_ENV || 'development'
const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || (ENV === 'production' ? 'info' : 'debug')

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

/**
 * Format error for logging
 */
function formatError(error: unknown): LogEntry['error'] | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as Error & { code?: string }).code,
    }
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: DEFAULT_SERVICE,
    environment: ENV,
    context: context && Object.keys(context).length > 0 ? context : undefined,
    error: formatError(error),
  }
}

/**
 * Output log entry
 */
function outputLog(entry: LogEntry): void {
  const output = JSON.stringify(entry)

  switch (entry.level) {
    case 'debug':
      console.debug(output)
      break
    case 'info':
      console.info(output)
      break
    case 'warn':
      console.warn(output)
      break
    case 'error':
    case 'fatal':
      console.error(output)
      break
  }
}

/**
 * Main logger class
 */
class Logger {
  private defaultContext: LogContext

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext
  }

  /**
   * Create a child logger with additional default context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...context })
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      outputLog(createLogEntry('debug', message, { ...this.defaultContext, ...context }))
    }
  }

  /**
   * Log at info level
   */
  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      outputLog(createLogEntry('info', message, { ...this.defaultContext, ...context }))
    }
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: LogContext, error?: unknown): void {
    if (shouldLog('warn')) {
      outputLog(createLogEntry('warn', message, { ...this.defaultContext, ...context }, error))
    }
  }

  /**
   * Log at error level
   */
  error(message: string, context?: LogContext, error?: unknown): void {
    if (shouldLog('error')) {
      outputLog(createLogEntry('error', message, { ...this.defaultContext, ...context }, error))
    }
  }

  /**
   * Log at fatal level
   */
  fatal(message: string, context?: LogContext, error?: unknown): void {
    if (shouldLog('fatal')) {
      outputLog(createLogEntry('fatal', message, { ...this.defaultContext, ...context }, error))
    }
  }

  /**
   * Log API request
   */
  request(
    method: string,
    path: string,
    context?: Omit<LogContext, 'method' | 'path'>
  ): void {
    this.info(`${method} ${path}`, {
      ...this.defaultContext,
      ...context,
      method,
      path,
    })
  }

  /**
   * Log API response
   */
  response(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    context?: Omit<LogContext, 'method' | 'path' | 'statusCode' | 'durationMs'>
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'

    if (shouldLog(level)) {
      outputLog(
        createLogEntry(level, `${method} ${path} ${statusCode} ${durationMs}ms`, {
          ...this.defaultContext,
          ...context,
          method,
          path,
          statusCode,
          durationMs,
        })
      )
    }
  }

  /**
   * Log database query
   */
  query(
    operation: string,
    table: string,
    durationMs?: number,
    context?: LogContext
  ): void {
    this.debug(`DB ${operation} ${table}${durationMs ? ` ${durationMs}ms` : ''}`, {
      ...this.defaultContext,
      ...context,
      operation,
      table,
      durationMs,
    })
  }

  /**
   * Log audit event
   */
  audit(
    action: string,
    entityType: string,
    entityId: string,
    context?: LogContext
  ): void {
    this.info(`AUDIT ${action} ${entityType}:${entityId}`, {
      ...this.defaultContext,
      ...context,
      action,
      entityType,
      entityId,
    })
  }

  // TASK-057: Chat-specific logging methods

  /**
   * Log chat message received
   */
  chatMessage(
    sessionId: string,
    messageType: 'user' | 'assistant' | 'tool',
    context?: Omit<LogContext, 'sessionId' | 'messageType'>
  ): void {
    this.info(`CHAT ${messageType} message`, {
      ...this.defaultContext,
      ...context,
      sessionId,
      messageType,
      component: 'chat',
    })
  }

  /**
   * Log chat tool execution
   */
  chatTool(
    sessionId: string,
    toolName: string,
    success: boolean,
    durationMs?: number,
    context?: LogContext
  ): void {
    const level: LogLevel = success ? 'info' : 'warn'
    if (shouldLog(level)) {
      outputLog(
        createLogEntry(level, `CHAT TOOL ${toolName} ${success ? 'success' : 'failed'}`, {
          ...this.defaultContext,
          ...context,
          sessionId,
          toolName,
          success,
          durationMs,
          component: 'chat',
        })
      )
    }
  }

  /**
   * Log chat session events
   */
  chatSession(
    sessionId: string,
    event: 'start' | 'end' | 'timeout' | 'error',
    context?: LogContext
  ): void {
    const level: LogLevel = event === 'error' ? 'error' : 'info'
    if (shouldLog(level)) {
      outputLog(
        createLogEntry(level, `CHAT SESSION ${event}`, {
          ...this.defaultContext,
          ...context,
          sessionId,
          event,
          component: 'chat',
        })
      )
    }
  }

  /**
   * Log AI model interaction
   */
  aiModel(
    sessionId: string,
    model: string,
    tokens: { input?: number; output?: number },
    durationMs?: number,
    context?: LogContext
  ): void {
    this.debug(`AI MODEL ${model}`, {
      ...this.defaultContext,
      ...context,
      sessionId,
      model,
      inputTokens: tokens.input,
      outputTokens: tokens.output,
      durationMs,
      component: 'ai',
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export function to create new logger instances
export function createLogger(context: LogContext = {}): Logger {
  return new Logger(context)
}

// Export utility functions for API routes
export function createRequestLogger(req: {
  method?: string
  url?: string
  headers?: { get?: (key: string) => string | null }
}): Logger {
  const requestId = req.headers?.get?.('x-request-id') || crypto.randomUUID()
  const userId = req.headers?.get?.('x-user-id') || undefined
  const tenantId = req.headers?.get?.('x-tenant-id') || undefined

  return new Logger({
    requestId,
    userId,
    tenantId,
    method: req.method,
    path: req.url,
  })
}

/**
 * Measure execution time and log it
 */
export async function withLogging<T>(
  logger: Logger,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    logger.debug(`${operation} completed`, { durationMs: duration })
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`${operation} failed`, { durationMs: duration }, error)
    throw error
  }
}

/**
 * Create a timing helper for performance logging
 */
export function createTimer() {
  const start = Date.now()
  return {
    elapsed: () => Date.now() - start,
    log: (logger: Logger, message: string, context?: LogContext) => {
      logger.info(message, { ...context, durationMs: Date.now() - start })
    },
  }
}

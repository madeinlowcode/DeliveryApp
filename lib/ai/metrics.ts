// AIDEV-NOTE: AI Chat metrics collector for observability
// Provides latency percentiles (p50, p95, p99) and token usage tracking per session/tenant

import { logger } from '@/lib/logger'

// AIDEV-NOTE: Chat metrics interface for tracking AI request performance
export interface ChatMetrics {
  /** Unique request identifier for correlation */
  requestId: string
  /** Tenant/establishment identifier */
  tenantId: string
  /** Chat session identifier */
  sessionId: string
  /** Request start timestamp (ms since epoch) */
  startTime: number
  /** Request end timestamp (ms since epoch) */
  endTime?: number
  /** Total latency in milliseconds */
  latencyMs?: number
  /** Number of input tokens consumed */
  inputTokens: number
  /** Number of output tokens generated */
  outputTokens: number
  /** List of tool calls made during the request */
  toolCalls: string[]
  /** Whether the request completed successfully */
  success: boolean
  /** Error message if request failed */
  error?: string
  /** Model used for the request */
  model?: string
}

// AIDEV-NOTE: Latency percentile results
export interface LatencyPercentiles {
  /** 50th percentile (median) latency in ms */
  p50: number
  /** 95th percentile latency in ms */
  p95: number
  /** 99th percentile latency in ms */
  p99: number
  /** Total number of samples */
  sampleCount: number
}

// AIDEV-NOTE: Token usage aggregation by tenant
export interface TokenUsage {
  /** Total input tokens */
  inputTokens: number
  /** Total output tokens */
  outputTokens: number
  /** Total tokens (input + output) */
  totalTokens: number
  /** Number of requests */
  requestCount: number
}

// AIDEV-NOTE: Metrics summary for dashboard/monitoring
export interface MetricsSummary {
  latency: LatencyPercentiles
  tokensByTenant: Map<string, TokenUsage>
  tokensBySession: Map<string, TokenUsage>
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  toolCallCounts: Map<string, number>
}

/**
 * MetricsCollector class for tracking AI chat performance
 * AIDEV-NOTE: Uses in-memory storage with sliding window for metrics
 * In production, this should be replaced with a proper metrics backend (Prometheus, DataDog, etc.)
 */
class MetricsCollector {
  // AIDEV-NOTE: In-memory metrics storage - consider Redis for distributed systems
  private metrics: ChatMetrics[] = []
  private activeRequests: Map<string, ChatMetrics> = new Map()

  // AIDEV-NOTE: Sliding window configuration
  private readonly maxMetrics: number
  private readonly windowMs: number

  constructor(options?: { maxMetrics?: number; windowMs?: number }) {
    this.maxMetrics = options?.maxMetrics ?? 10000
    this.windowMs = options?.windowMs ?? 3600000 // 1 hour default
  }

  /**
   * Start tracking a new request
   * AIDEV-NOTE: Call this at the beginning of each AI chat request
   */
  startRequest(
    requestId: string,
    tenantId: string,
    sessionId: string,
    model?: string
  ): void {
    const metric: ChatMetrics = {
      requestId,
      tenantId,
      sessionId,
      startTime: Date.now(),
      inputTokens: 0,
      outputTokens: 0,
      toolCalls: [],
      success: false,
      model,
    }

    this.activeRequests.set(requestId, metric)

    logger.debug('AI request started', {
      requestId,
      tenantId,
      sessionId,
      model,
    })
  }

  /**
   * Record a tool call for the request
   * AIDEV-NOTE: Call this each time a tool is invoked during the request
   */
  recordToolCall(requestId: string, toolName: string): void {
    const metric = this.activeRequests.get(requestId)
    if (metric) {
      metric.toolCalls.push(toolName)
    }
  }

  /**
   * Update token counts during streaming
   * AIDEV-NOTE: Can be called multiple times as tokens are received
   */
  updateTokens(
    requestId: string,
    tokens: { input?: number; output?: number }
  ): void {
    const metric = this.activeRequests.get(requestId)
    if (metric) {
      if (tokens.input !== undefined) {
        metric.inputTokens = tokens.input
      }
      if (tokens.output !== undefined) {
        metric.outputTokens = tokens.output
      }
    }
  }

  /**
   * End tracking a request and record final metrics
   * AIDEV-NOTE: Call this when the AI request completes or fails
   */
  endRequest(
    requestId: string,
    success: boolean,
    tokens?: { input: number; output: number },
    error?: string
  ): void {
    const metric = this.activeRequests.get(requestId)
    if (!metric) {
      logger.warn('Attempted to end non-existent request', { requestId })
      return
    }

    metric.endTime = Date.now()
    metric.latencyMs = metric.endTime - metric.startTime
    metric.success = success
    metric.error = error

    if (tokens) {
      metric.inputTokens = tokens.input
      metric.outputTokens = tokens.output
    }

    // Move from active to completed
    this.activeRequests.delete(requestId)
    this.metrics.push(metric)

    // AIDEV-NOTE: Cleanup old metrics to prevent memory issues
    this.pruneMetrics()

    logger.info('AI request completed', {
      requestId,
      tenantId: metric.tenantId,
      sessionId: metric.sessionId,
      latencyMs: metric.latencyMs,
      inputTokens: metric.inputTokens,
      outputTokens: metric.outputTokens,
      toolCalls: metric.toolCalls.length,
      success,
      error,
    })
  }

  /**
   * Calculate latency percentiles from collected metrics
   * AIDEV-NOTE: Uses simple percentile calculation; for production consider t-digest or HDR histogram
   */
  getLatencyPercentiles(): LatencyPercentiles {
    const latencies = this.getRecentMetrics()
      .filter((m) => m.latencyMs !== undefined)
      .map((m) => m.latencyMs!)
      .sort((a, b) => a - b)

    if (latencies.length === 0) {
      return { p50: 0, p95: 0, p99: 0, sampleCount: 0 }
    }

    return {
      p50: this.calculatePercentile(latencies, 50),
      p95: this.calculatePercentile(latencies, 95),
      p99: this.calculatePercentile(latencies, 99),
      sampleCount: latencies.length,
    }
  }

  /**
   * Get token usage aggregated by tenant
   * AIDEV-NOTE: Useful for billing and quota management
   */
  getTokensByTenant(tenantId?: string): TokenUsage | Map<string, TokenUsage> {
    const metrics = this.getRecentMetrics()

    if (tenantId) {
      const tenantMetrics = metrics.filter((m) => m.tenantId === tenantId)
      return this.aggregateTokens(tenantMetrics)
    }

    const byTenant = new Map<string, TokenUsage>()
    const tenantIds = new Set(metrics.map((m) => m.tenantId))

    for (const tid of tenantIds) {
      const tenantMetrics = metrics.filter((m) => m.tenantId === tid)
      byTenant.set(tid, this.aggregateTokens(tenantMetrics))
    }

    return byTenant
  }

  /**
   * Get token usage aggregated by session
   * AIDEV-NOTE: Useful for conversation-level analytics
   */
  getTokensBySession(sessionId?: string): TokenUsage | Map<string, TokenUsage> {
    const metrics = this.getRecentMetrics()

    if (sessionId) {
      const sessionMetrics = metrics.filter((m) => m.sessionId === sessionId)
      return this.aggregateTokens(sessionMetrics)
    }

    const bySession = new Map<string, TokenUsage>()
    const sessionIds = new Set(metrics.map((m) => m.sessionId))

    for (const sid of sessionIds) {
      const sessionMetrics = metrics.filter((m) => m.sessionId === sid)
      bySession.set(sid, this.aggregateTokens(sessionMetrics))
    }

    return bySession
  }

  /**
   * Get comprehensive metrics summary
   * AIDEV-NOTE: Useful for dashboard and monitoring endpoints
   */
  getSummary(): MetricsSummary {
    const metrics = this.getRecentMetrics()

    const toolCallCounts = new Map<string, number>()
    for (const metric of metrics) {
      for (const tool of metric.toolCalls) {
        toolCallCounts.set(tool, (toolCallCounts.get(tool) || 0) + 1)
      }
    }

    return {
      latency: this.getLatencyPercentiles(),
      tokensByTenant: this.getTokensByTenant() as Map<string, TokenUsage>,
      tokensBySession: this.getTokensBySession() as Map<string, TokenUsage>,
      totalRequests: metrics.length,
      successfulRequests: metrics.filter((m) => m.success).length,
      failedRequests: metrics.filter((m) => !m.success).length,
      toolCallCounts,
    }
  }

  /**
   * Get active requests count (for monitoring)
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics = []
    this.activeRequests.clear()
  }

  // Private helper methods

  private getRecentMetrics(): ChatMetrics[] {
    const cutoff = Date.now() - this.windowMs
    return this.metrics.filter((m) => m.startTime >= cutoff)
  }

  private pruneMetrics(): void {
    // Remove old metrics beyond window
    const cutoff = Date.now() - this.windowMs
    this.metrics = this.metrics.filter((m) => m.startTime >= cutoff)

    // Also cap at maxMetrics to prevent unbounded growth
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0

    const index = (percentile / 100) * (sortedValues.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)

    if (lower === upper) {
      return sortedValues[lower]
    }

    // Linear interpolation
    const fraction = index - lower
    return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * fraction
  }

  private aggregateTokens(metrics: ChatMetrics[]): TokenUsage {
    const inputTokens = metrics.reduce((sum, m) => sum + m.inputTokens, 0)
    const outputTokens = metrics.reduce((sum, m) => sum + m.outputTokens, 0)

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      requestCount: metrics.length,
    }
  }
}

// AIDEV-NOTE: Export singleton instance for global metrics collection
export const metricsCollector = new MetricsCollector()

// AIDEV-NOTE: Export class for testing or creating isolated collectors
export { MetricsCollector }

/**
 * Generate a unique request ID with correlation support
 * AIDEV-NOTE: Format: ai-{timestamp}-{random} for easy identification and sorting
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `ai-${timestamp}-${random}`
}

/**
 * Helper to track a complete AI request with metrics
 * AIDEV-NOTE: Wraps an async function with automatic metrics tracking
 */
export async function withMetrics<T>(
  tenantId: string,
  sessionId: string,
  fn: (requestId: string) => Promise<T>,
  options?: { model?: string }
): Promise<{ result: T; requestId: string }> {
  const requestId = generateRequestId()

  metricsCollector.startRequest(requestId, tenantId, sessionId, options?.model)

  try {
    const result = await fn(requestId)
    metricsCollector.endRequest(requestId, true)
    return { result, requestId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    metricsCollector.endRequest(requestId, false, undefined, errorMessage)
    throw error
  }
}

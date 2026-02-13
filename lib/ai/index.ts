// AIDEV-NOTE: AI module barrel export
// Re-exports all AI-related functionality

// Provider exports
export { openrouter, DEFAULT_MODEL, MODELS, getModel } from "./provider"

// Type exports
export type {
  MessageRole,
  ChatMessage,
  ToolCall,
  ToolOutput,
  ConversationContext,
  AIResponse,
  ToolDefinition,
  StreamEventType,
  StreamEvent,
  ChatSession,
} from "./types"

// Metrics exports
export {
  metricsCollector,
  MetricsCollector,
  generateRequestId,
  withMetrics,
} from "./metrics"
export type {
  ChatMetrics,
  LatencyPercentiles,
  TokenUsage,
  MetricsSummary,
} from "./metrics"

// Error handler exports
export {
  AIError,
  handleAIError,
  createProductUnavailableError,
  createPriceChangedError,
  createStoreClosedError,
  createTimeoutError,
  withErrorHandler,
  isRetryableError,
  getRetryDelay,
  formatErrorResponse,
  withRetry,
  errorMessages,
} from "./error-handler"
export type { AIErrorCode, AIErrorContext } from "./error-handler"

// System prompt exports (TASK-021 to TASK-023)
export {
  generateSystemPrompt,
  generateMinimalSystemPrompt,
  establishmentToTenant,
} from "./system-prompt"

// AI Menu Service exports (TASK-024 to TASK-027)
export { aiMenuService } from "./ai-menu.service"
export type { CategoryWithCount, AIProductDisplay } from "./ai-menu.service"

// Operating Hours Service exports (TASK-028 to TASK-029)
export { operatingHoursService } from "./operating-hours.service"
export type { OperatingHoursResult } from "./operating-hours.service"

// Order Service exports (TASK-036 to TASK-039)
export { orderService } from "./order.service"
export type {
  CreateOrderInput,
  CreateOrderResult,
  OrderStatusResult,
} from "./order.service"

// Re-export tenant types for convenience
export type { Tenant, BusinessHours, DayHours } from "@/types/cart"

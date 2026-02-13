// TASK-004: AI types for chat and tool interactions
// AIDEV-NOTE: Types for the AI agent chat system with tool calling capabilities

// AIDEV-NOTE: Message roles in the conversation
export type MessageRole = "user" | "assistant" | "system" | "tool"

// AIDEV-NOTE: Chat message structure for the conversation history
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: Date
  // AIDEV-NOTE: Tool calls made by the assistant
  toolCalls?: ToolCall[]
  // AIDEV-NOTE: Tool outputs when role is "tool"
  toolOutput?: ToolOutput
}

// AIDEV-NOTE: Tool call made by the AI assistant
export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

// AIDEV-NOTE: Output from a tool execution
export interface ToolOutput {
  toolCallId: string
  result: unknown
  error?: string
}

// AIDEV-NOTE: Conversation context passed to the AI
export interface ConversationContext {
  tenantId: string
  sessionId: string
  customerPhone?: string
  customerName?: string
}

// AIDEV-NOTE: AI response structure
export interface AIResponse {
  message: string
  toolCalls?: ToolCall[]
  isComplete: boolean
}

// AIDEV-NOTE: Tool definition for the AI system
export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

// AIDEV-NOTE: Stream event types for real-time responses
export type StreamEventType =
  | "text-delta"
  | "tool-call-start"
  | "tool-call-delta"
  | "tool-call-complete"
  | "finish"
  | "error"

export interface StreamEvent {
  type: StreamEventType
  data: unknown
}

// AIDEV-NOTE: Chat session state
export interface ChatSession {
  id: string
  tenantId: string
  customerPhone?: string
  customerName?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

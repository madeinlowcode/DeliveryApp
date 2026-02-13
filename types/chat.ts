// AIDEV-NOTE: Chat types for customer chat feature (FEAT-001)
// Compatible with @assistant-ui/react message format

import type { ThreadMessage } from '@assistant-ui/react'

/**
 * Message role in the conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Chat message with Assistant UI compatibility
 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string | Array<{ type: string; text: string }>
  createdAt?: Date
  toolOutputs?: ToolOutput[]
}

/**
 * Tool execution result from AI agent
 */
export interface ToolOutput {
  toolCallId: string
  toolName: string
  result: unknown
  isError?: boolean
}

/**
 * Chat state for session management
 */
export interface ChatState {
  sessionId: string
  establishmentId: string
  messages: ChatMessage[]
  isPending: boolean
  error: string | null
  lastMessageAt?: Date
}

/**
 * Customer information collected during chat
 */
export interface ChatCustomerInfo {
  phone?: string
  name?: string
  addresses?: string[]
}

/**
 * Chat thread history item
 */
export interface ChatThread {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  lastMessage?: string
}

/**
 * Chat composer state
 */
export interface ChatComposerState {
  input: string
  isAttachmentMenuOpen: boolean
  attachments: ChatAttachment[]
}

/**
 * File attachment for chat
 */
export interface ChatAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

/**
 * Chat UI layout state
 */
export interface ChatLayoutState {
  sidebarOpen: boolean
  sidebarWidth: number
  isMobile: boolean
}

/**
 * Chat status enum
 */
export enum ChatStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  THINKING = 'thinking',
  ERROR = 'error',
  SUCCESS = 'success',
}

/**
 * Convert Assistant UI ThreadMessage to ChatMessage
 */
export function assistantMessageToChatMessage(message: ThreadMessage): ChatMessage {
  return {
    id: message.id ?? crypto.randomUUID(),
    role: message.role as MessageRole,
    content:
      typeof message.content === 'string'
        ? message.content
        : message.content.map((part) => ({
            type: part.type,
            text: 'text' in part ? part.text : '',
          })),
    createdAt: new Date(),
  }
}

/**
 * Convert ChatMessage to Assistant UI ThreadMessage
 */
export function chatMessageToAssistantMessage(message: ChatMessage): ThreadMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content as ThreadMessage['content'],
    createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
    metadata: {},
  } as unknown as ThreadMessage
}

// AIDEV-NOTE: Runtime interface for sending messages from UI components
export interface ChatRuntime {
  send: (message: string) => void
  append: (message: Partial<ChatMessage>) => void
}

// AIDEV-NOTE: Props for components that need runtime access
export interface WithRuntimeProps {
  runtime: ChatRuntime
}

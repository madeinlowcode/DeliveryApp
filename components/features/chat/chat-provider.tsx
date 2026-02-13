'use client'

// AIDEV-NOTE: Chat provider using Assistant UI's runtime system
// Wraps the chat components with AI SDK integration
// AIDEV-NOTE: Updated to use useChatRuntime with AssistantChatTransport (v6 API)

import type { ReactNode } from 'react'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'

import { useChatSession } from '@/hooks/use-chat-session'

interface ChatProviderProps {
  children: ReactNode
  // AIDEV-NOTE: T-006 - tenantId prop is actually the slug from the URL
  tenantId: string
}

/**
 * Chat provider component
 * Integrates with AI SDK and provides session context
 * AIDEV-NOTE: T-006 FIX: Pass tenantSlug to API via body for each request
 */
export function ChatProvider({ children, tenantId }: ChatProviderProps) {
  const sessionId = useChatSession()

  // AIDEV-NOTE: Use useChatRuntime with AssistantChatTransport for v6 API
  // T-006 FIX: Pass tenantSlug in body for each request - the API expects tenantSlug
  // AIDEV-NOTE: Always call hooks in the same order - runtime is created first
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat',
      body: {
        tenantSlug: tenantId,
        sessionId: sessionId ?? '',
      },
    }),
  })

  // AIDEV-NOTE: Don't render until sessionId is available (after hooks)
  if (!sessionId) {
    return null
  }

  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}

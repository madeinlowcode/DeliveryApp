'use client'

// AIDEV-NOTE: Chat provider using Assistant UI's runtime system
// Wraps the chat components with AI SDK integration
// AIDEV-NOTE: Updated to use useChatRuntime with AssistantChatTransport (v6 API)
// AIDEV-NOTE: T-015 - Added hydration tracking to show skeleton instead of null

import type { ReactNode } from 'react'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { useSyncExternalStore } from 'react'

import { useChatSession } from '@/hooks/use-chat-session'
import { Skeleton } from '@/components/ui/skeleton'

interface ChatProviderProps {
  children: ReactNode
  // AIDEV-NOTE: T-006 - tenantId prop is actually the slug from the URL
  tenantId: string
}

/**
 * AIDEV-NOTE: Skeleton loading component shown during hydration
 * Displays a chat-like skeleton UI while session is being initialized
 */
function ChatLoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

/**
 * Chat provider component
 * Integrates with AI SDK and provides session context
 * AIDEV-NOTE: T-006 FIX: Pass tenantSlug to API via body for each request
 * AIDEV-NOTE: T-015 FIX: Shows skeleton during hydration instead of returning null
 */
// AIDEV-NOTE: SSR-safe hydration store using useSyncExternalStore
const emptySubscribe = () => () => {}

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function ChatProvider({ children, tenantId }: ChatProviderProps) {
  const sessionId = useChatSession()
  // AIDEV-NOTE: T-015 - SSR-safe hydration detection
  const isHydrated = useHydrated()

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

  // AIDEV-NOTE: T-015 FIX - Show skeleton during hydration instead of null
  // This prevents layout shift and provides better UX
  if (!isHydrated || !sessionId) {
    return <ChatLoadingSkeleton />
  }

  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}

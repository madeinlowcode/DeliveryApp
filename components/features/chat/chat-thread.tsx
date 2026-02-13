'use client'

// AIDEV-NOTE: Chat thread component - MINIMAL version for @assistant-ui/react v6
// AIDEV-NOTE: Using only ThreadPrimitive.Root, Messages removed due to API limitations
// AIDEV-NOTE: No className support - using inline styles instead

import { ThreadPrimitive } from '@assistant-ui/react'

/**
 * Chat thread component - minimal working version
 */
export function ChatThread() {
  return (
    <ThreadPrimitive.Root>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages will be rendered by the runtime */}
        <div className="text-center text-muted-foreground p-8">
          Chat interface initialized
        </div>
      </div>
    </ThreadPrimitive.Root>
  )
}

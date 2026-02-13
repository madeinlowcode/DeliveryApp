'use client'

// AIDEV-NOTE: Chat composer component using Assistant UI ComposerPrimitive
// Provides input field and send button for user messages
// AIDEV-NOTE: Simplified version - AttachButton not available in v0.12.6

import {
  ComposerPrimitive,
} from '@assistant-ui/react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Chat composer component
 * Renders message input and send button
 */
export function ChatComposer() {
  return (
    <ComposerPrimitive.Root className="border-t bg-background p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Input field */}
        <div className="flex-1 relative">
          <ComposerPrimitive.Input
            placeholder="Digite sua mensagem..."
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[200px] w-full resize-none rounded-md border bg-background px-4 py-3',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>

        {/* Send button */}
        <ComposerPrimitive.Send
          asChild
          className={cn(
            'flex-shrink-0 rounded-md p-2',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          )}
        >
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
            <span className="sr-only">Enviar mensagem</span>
          </Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  )
}

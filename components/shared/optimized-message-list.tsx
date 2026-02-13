// TASK-069: Optimized message list with memoization
// AIDEV-PERF: React.memo optimization for chat/message lists

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  isTyping?: boolean
}

interface OptimizedMessageListProps {
  messages: Message[]
  className?: string
}

/**
 * Individual message component (memoized)
 */
const MessageItem = React.memo<{
  message: Message
  isLast?: boolean
}>(({ message, isLast }) => {
  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        message.role === 'user' && 'justify-end',
        message.isTyping && 'opacity-70'
      )}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-sm font-medium">AI</span>
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm',
          message.role === 'system' && 'bg-muted/50 text-muted-foreground text-sm italic'
        )}
      >
        {message.isTyping ? (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-primary text-sm font-medium">You</span>
        </div>
      )}
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

/**
 * OptimizedMessageList component
 * Renders a list of messages with React.memo optimization
 * Prevents unnecessary re-renders of individual messages
 *
 * @example
 * ```tsx
 * const messages = [{ id: '1', content: 'Hello', role: 'user', timestamp: new Date() }]
 * <OptimizedMessageList messages={messages} />
 * ```
 */
export const OptimizedMessageList = React.memo<OptimizedMessageListProps>(
  ({ messages, className }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const prevMessagesLengthRef = React.useRef(0)

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
      if (messages.length > prevMessagesLengthRef.current) {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      prevMessagesLengthRef.current = messages.length
    }, [messages.length])

    if (messages.length === 0) {
      return (
        <div className={cn('flex flex-col items-center justify-center p-8', className)}>
          <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
        </div>
      )
    }

    return (
      <div className={cn('flex flex-col', className)}>
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
        <div ref={scrollRef} />
      </div>
    )
  }
)

OptimizedMessageList.displayName = 'OptimizedMessageList'

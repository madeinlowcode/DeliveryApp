// TASK-013: User message component with avatar and right-aligned text
// AIDEV-NOTE: Displays user messages in the chat interface

"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/ai/types"

interface UserMessageProps {
  message: ChatMessage
  className?: string
}

export function UserMessage({ message, className }: UserMessageProps) {
  return (
    <div
      data-slot="user-message"
      className={cn(
        "flex gap-3 justify-end",
        className
      )}
    >
      {/* Message content - right aligned */}
      <div className="flex flex-col items-end gap-1 max-w-[80%]">
        <div
          className={cn(
            "bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm",
            "break-words text-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>

      {/* User avatar */}
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          VC
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

// AIDEV-NOTE: Format message timestamp
function formatMessageTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

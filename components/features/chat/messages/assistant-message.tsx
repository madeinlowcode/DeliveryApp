// TASK-014: Assistant message component with bot avatar and ToolRenderer
// AIDEV-NOTE: Displays AI assistant messages including tool outputs

"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/ai/types"
import { ToolRenderer } from "../tools/tool-renderer"

interface AssistantMessageProps {
  message: ChatMessage
  className?: string
}

export function AssistantMessage({ message, className }: AssistantMessageProps) {
  return (
    <div
      data-slot="assistant-message"
      className={cn(
        "flex gap-3 justify-start",
        className
      )}
    >
      {/* Bot avatar */}
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <Bot className="size-4" />
        </AvatarFallback>
      </Avatar>

      {/* Message content with tool outputs */}
      <div className="flex flex-col items-start gap-2 max-w-[85%]">
        {/* Text content if present */}
        {message.content && (
          <div
            className={cn(
              "bg-muted/50 px-4 py-2.5 rounded-2xl rounded-tl-sm",
              "break-words text-sm"
            )}
          >
            {message.content}
          </div>
        )}

        {/* Render tool outputs */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-col gap-3 w-full">
            {message.toolCalls.map((toolCall) => (
              <ToolRenderer
                key={toolCall.id}
                toolName={toolCall.name}
                toolArgs={toolCall.arguments}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground px-1">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
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

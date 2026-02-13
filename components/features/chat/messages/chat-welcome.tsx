// TASK-015: Chat welcome message with tenant branding
// AIDEV-NOTE: Displays personalized welcome message when chat starts

"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Establishment } from "@/types/database"

interface ChatWelcomeProps {
  establishment: Establishment
  customerName?: string
  className?: string
}

export function ChatWelcome({
  establishment,
  customerName,
  className,
}: ChatWelcomeProps) {
  // AIDEV-NOTE: Personalized greeting based on customer recognition
  const greeting = customerName
    ? `Olá, ${customerName}! Bem-vindo de volta!`
    : "Olá! Bem-vindo!"

  const welcomeMessage = `${greeting} Como posso ajudar você hoje?`

  return (
    <div
      data-slot="chat-welcome"
      className={cn(
        "flex flex-col items-center gap-4 py-6 px-4",
        className
      )}
    >
      {/* Establishment logo or bot avatar */}
      {establishment.logo_url ? (
        <div className="relative">
          <Avatar size="lg">
            {/* AvatarImage would use establishment.logo_url */}
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-semibold">
              {getInitials(establishment.name)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full size-4 border-2 border-background" />
        </div>
      ) : (
        <Avatar size="lg">
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Bot className="size-6" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Establishment name */}
      <div className="text-center">
        <h2 className="font-semibold text-lg">{establishment.name}</h2>
        {establishment.address && (
          <p className="text-sm text-muted-foreground mt-1">
            {establishment.address}
          </p>
        )}
      </div>

      {/* Welcome message */}
      <div className="bg-muted/50 rounded-2xl px-6 py-4 max-w-md text-center">
        <p className="text-sm">{welcomeMessage}</p>
      </div>

      {/* Quick action suggestions */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        <QuickActionButton label="Ver cardápio" emoji="🍔" />
        <QuickActionButton label="Meus pedidos" emoji="📋" />
        <QuickActionButton label="Horário" emoji="🕐" />
      </div>
    </div>
  )
}

// AIDEV-NOTE: Quick action button for common queries
interface QuickActionButtonProps {
  label: string
  emoji: string
}

function QuickActionButton({ label, emoji }: QuickActionButtonProps) {
  return (
    <button
      data-slot="quick-action"
      className="inline-flex items-center gap-2 px-3 py-2 bg-background hover:bg-muted rounded-lg border text-sm font-medium transition-colors"
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

// AIDEV-NOTE: Get initials from establishment name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

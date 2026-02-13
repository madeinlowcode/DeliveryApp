'use client'

// AIDEV-NOTE: Chat sidebar component - displays tenant logo and conversation history
// Shows tenant branding and recent chat threads

import type { ReactNode } from 'react'

import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  tenantId: string
  className?: string
}

/**
 * Chat sidebar component
 */
export function ChatSidebar({ tenantId, className }: ChatSidebarProps) {
  // AIDEV-TODO: Fetch tenant info from Supabase for logo display
  // AIDEV-TODO: Fetch conversation history for current tenant

  return (
    <div className={cn('flex flex-col h-full p-4', className)}>
      {/* Tenant logo/branding */}
      <div className="mb-6">
        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
          {/* AIDEV-TODO: Display tenant logo */}
          <span className="text-2xl font-bold text-muted-foreground">
            {tenantId.slice(0, 2).toUpperCase()}
          </span>
        </div>
        {/* AIDEV-TODO: Display tenant name */}
        <p className="text-sm text-center text-muted-foreground">
          Converse conosco
        </p>
      </div>

      {/* New chat button */}
      <Button variant="outline" className="w-full justify-start gap-2 mb-4">
        <MessageSquarePlus className="h-4 w-4" />
        Nova conversa
      </Button>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-2 px-2">Histórico</p>
        <div className="space-y-1">
          {/* AIDEV-TODO: Render conversation threads from history */}
          <p className="text-xs text-muted-foreground px-2 italic">
            Nenhuma conversa anterior
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for sidebar
 */
export function ChatSidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full p-4', className)}>
      <Skeleton className="aspect-square rounded-lg mb-2" />
      <Skeleton className="h-4 w-full mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-10 w-full mb-2" />
      <Skeleton className="h-10 w-full mb-2" />
    </div>
  )
}

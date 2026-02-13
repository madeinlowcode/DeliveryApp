'use client'

// AIDEV-NOTE: Main chat layout component - grid with sidebar and thread
// Responsive design: sidebar hidden on mobile

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ChatLayoutProps {
  sidebar: ReactNode
  thread: ReactNode
  composer: ReactNode
  className?: string
}

/**
 * Chat layout container
 * Organizes sidebar, message thread, and composer in responsive grid
 */
export function ChatLayout({
  sidebar,
  thread,
  composer,
  className,
}: ChatLayoutProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-[280px_1fr] h-full',
        className
      )}
    >
      {/* Sidebar - hidden on mobile by default */}
      <aside className="hidden md:block border-r bg-muted/10">
        {sidebar}
      </aside>

      {/* Main chat area */}
      <main className="flex flex-col h-full overflow-hidden">
        {/* Thread/messages */}
        <div className="flex-1 overflow-y-auto">{thread}</div>

        {/* Composer at bottom */}
        <div className="border-t bg-background">{composer}</div>
      </main>
    </div>
  )
}

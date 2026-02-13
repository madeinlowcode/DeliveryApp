// AIDEV-NOTE: Customer chat page - loads tenant and provides ChatProvider
// Uses Suspense boundary for loading state

import { Suspense } from 'react'

import { ChatProvider } from '@/components/features/chat/chat-provider'
import { ChatLayout } from '@/components/features/chat/chat-layout'
import { ChatComposer } from '@/components/features/chat/chat-composer'
import { ChatSidebar } from '@/components/features/chat/chat-sidebar'
import { ChatThread } from '@/components/features/chat/chat-thread'

import { LoadingSkeleton } from './loading'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Customer chat page component
 */
export default async function CustomerChatPage({ params }: PageProps) {
  const { slug } = await params

  // AIDEV-TODO: Fetch tenant from Supabase by slug
  // const tenant = await getTenantBySlug(slug)
  // if (!tenant?.isActive) notFound()

  const tenantId = slug // Temporary - use real ID from Supabase

  return (
    <ChatProvider tenantId={tenantId}>
      <Suspense fallback={<LoadingSkeleton />}>
        <ChatLayout
          sidebar={<ChatSidebar tenantId={tenantId} />}
          thread={<ChatThread />}
          composer={<ChatComposer />}
        />
      </Suspense>
    </ChatProvider>
  )
}

/**
 * Generate static params for static generation
 * Uncomment if using static generation
 */
// export async function generateStaticParams() {
//   const tenants = await getAllActiveTenants()
//   return tenants.map((tenant) => ({ slug: tenant.slug }))
// }

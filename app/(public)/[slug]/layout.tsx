// AIDEV-NOTE: Dynamic layout for tenant customer chat pages
// Sets meta tags based on tenant information from params

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

/**
 * Generate metadata for tenant chat page
 * In production, fetch tenant info to set accurate meta tags
 */
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  // AIDEV-TODO: Fetch tenant info from Supabase to get real name, logo
  // const tenant = await getTenantBySlug(slug)
  // if (!tenant) notFound()

  const tenantName = slug.charAt(0).toUpperCase() + slug.slice(1)

  return {
    title: {
      default: `Chat - ${tenantName}`,
      template: `%s | ${tenantName}`,
    },
    description: `Converse com ${tenantName} pelo nosso chat inteligente`,
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: `Chat - ${tenantName}`,
      description: `Converse com ${tenantName} pelo nosso chat inteligente`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Chat - ${tenantName}`,
      description: `Converse com ${tenantName} pelo nosso chat inteligente`,
    },
  }
}

/**
 * Layout for customer chat pages
 */
export default async function SlugLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen flex-col">{children}</div>
    </div>
  )
}

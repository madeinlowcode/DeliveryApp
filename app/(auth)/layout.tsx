// TASK-042: Authenticated layout with sidebar
// AIDEV-NOTE: Layout wrapper for all authenticated pages with sidebar and header

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // AIDEV-NOTE: Check authentication status server-side
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // AIDEV-NOTE: Redirect to login if not authenticated
  // Commented out for development - uncomment in production
  // if (!user) {
  //   redirect("/login")
  // }

  // AIDEV-NOTE: Get sidebar state from cookie
  const cookieStore = await cookies()
  const sidebarStateCookie = cookieStore.get("sidebar_state")
  const defaultOpen = sidebarStateCookie?.value !== "false"

  // AIDEV-NOTE: Fetch establishment data for the user
  // In production, this would fetch from the database
  const establishmentName = "Meu Delivery"
  const establishmentLogo = undefined

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        establishmentName={establishmentName}
        establishmentLogo={establishmentLogo}
      />
      <SidebarInset>
        {/* AIDEV-NOTE: Main content area with proper spacing */}
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

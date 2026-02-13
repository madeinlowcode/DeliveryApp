"use client"

// TASK-041: User navigation component with avatar and dropdown menu
// AIDEV-NOTE: Displays current user info and actions (profile, settings, logout)

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  User as UserIcon,
  Moon,
  Sun,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getClient } from "@/lib/supabase/client"

interface UserNavProps {
  user?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: "admin" | "manager" | "operator"
  } | null
}

// AIDEV-NOTE: Get user initials for avatar fallback
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

// AIDEV-NOTE: Role label mapping
const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  operator: "Operador",
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const { isMobile, state } = useSidebar()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  // AIDEV-NOTE: Mock user data for development - replace with real auth data
  const currentUser = user ?? {
    id: "mock-user-id",
    email: "usuario@delivery.com",
    full_name: "Usuario Demo",
    avatar_url: null,
    role: "admin" as const,
  }

  // AIDEV-NOTE: Handle logout with Supabase
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = getClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  src={currentUser.avatar_url ?? undefined}
                  alt={currentUser.full_name ?? currentUser.email}
                />
                <AvatarFallback className="rounded-lg">
                  {getInitials(currentUser.full_name, currentUser.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentUser.full_name ?? currentUser.email}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {roleLabels[currentUser.role] ?? currentUser.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* AIDEV-NOTE: User info header */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={currentUser.avatar_url ?? undefined}
                    alt={currentUser.full_name ?? currentUser.email}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(currentUser.full_name, currentUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentUser.full_name ?? "Usuario"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* AIDEV-NOTE: User actions */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <UserIcon className="mr-2 size-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 size-4" />
                  Configuracoes
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* AIDEV-NOTE: Theme toggle - placeholder for future implementation */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  // AIDEV-TODO: Implement theme toggle
                  document.documentElement.classList.toggle("dark")
                }}
              >
                <Sun className="mr-2 size-4 dark:hidden" />
                <Moon className="mr-2 hidden size-4 dark:block" />
                Alternar Tema
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* AIDEV-NOTE: Logout action */}
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
            >
              <LogOut className="mr-2 size-4" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

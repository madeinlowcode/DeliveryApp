"use client"

// TASK-039: Application sidebar with navigation
// AIDEV-NOTE: Main navigation sidebar using shadcn/ui Sidebar components

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  Package,
  Users,
  BarChart3,
  Store,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/features/auth/user-nav"

// AIDEV-NOTE: Navigation items configuration
const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visao geral e Kanban de pedidos",
  },
  {
    title: "Cardapio",
    href: "/menu",
    icon: UtensilsCrossed,
    description: "Gerenciar produtos e categorias",
  },
  {
    title: "Pedidos",
    href: "/orders",
    icon: Package,
    description: "Historico de pedidos",
  },
]

const secondaryNavItems = [
  {
    title: "Relatorios",
    href: "/reports",
    icon: BarChart3,
    description: "Estatisticas e metricas",
  },
  {
    title: "Clientes",
    href: "/customers",
    icon: Users,
    description: "Base de clientes",
  },
]

const settingsNavItems = [
  {
    title: "Configuracoes",
    href: "/settings",
    icon: Settings,
    description: "Configuracoes do estabelecimento",
  },
  {
    title: "Estabelecimento",
    href: "/settings/establishment",
    icon: Store,
    description: "Dados do estabelecimento",
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  establishmentName?: string
  establishmentLogo?: string
}

export function AppSidebar({
  establishmentName = "Meu Delivery",
  establishmentLogo,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()

  // AIDEV-NOTE: Check if current path matches nav item
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* AIDEV-NOTE: Sidebar Header with establishment branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {establishmentLogo ? (
                    <img
                      src={establishmentLogo}
                      alt={establishmentName}
                      className="size-5 object-contain"
                    />
                  ) : (
                    <Store className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{establishmentName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    Painel de Controle
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* AIDEV-NOTE: Main navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AIDEV-NOTE: Secondary navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AIDEV-NOTE: Settings navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* AIDEV-NOTE: Sidebar footer with user navigation */}
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

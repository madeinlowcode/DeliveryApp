"use client"

// TASK-040: Application header with logo and user dropdown
// AIDEV-NOTE: Header component for authenticated pages

import * as React from "react"
import Link from "next/link"
import { Bell, Search, Store } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface HeaderProps {
  establishmentName?: string
  establishmentLogo?: string
  breadcrumbs?: Array<{
    title: string
    href?: string
  }>
  showSearch?: boolean
  children?: React.ReactNode
}

export function Header({
  establishmentName = "Meu Delivery",
  establishmentLogo,
  breadcrumbs = [],
  showSearch = false,
  children,
}: HeaderProps) {
  const { state } = useSidebar()

  return (
    <header
      data-slot="header"
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 items-center gap-4 border-b px-4 backdrop-blur",
        "md:px-6"
      )}
    >
      {/* AIDEV-NOTE: Sidebar toggle and breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* AIDEV-NOTE: Breadcrumb navigation */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  {establishmentName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.title}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 || !crumb.href ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* AIDEV-NOTE: Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Optional search input */}
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
            <Input
              type="search"
              placeholder="Buscar pedidos..."
              className="w-[200px] pl-8 lg:w-[300px]"
            />
          </div>
        )}

        {/* Notification button */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {/* AIDEV-NOTE: Notification badge - show when there are new orders */}
          <span className="bg-destructive absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full text-[10px] text-white">
            3
          </span>
          <span className="sr-only">Notificacoes</span>
        </Button>

        {/* Additional header content passed as children */}
        {children}
      </div>
    </header>
  )
}

// AIDEV-NOTE: Simpler header for pages that don't need breadcrumbs
export function SimpleHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="simple-header"
      className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between md:pb-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm md:text-base">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// TASK-043: Mobile sidebar using Sheet component
// AIDEV-NOTE: Collapsible sidebar that opens as Sheet on mobile (<768px)

"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileSidebarProps {
  className?: string
}

// AIDEV-NOTE: Mobile sidebar wrapper that uses Sheet on small screens
export function MobileSidebar({ className }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  // AIDEV-NOTE: Close sheet when navigating
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  // AIDEV-NOTE: On mobile, show sheet with trigger button
  if (isMobile) {
    return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <AppSidebar />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: don't render anything
  return null
}
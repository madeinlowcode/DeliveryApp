// TASK-057: Skip to content link for accessibility
// AIDEV-NOTE: WCAG 2.1 AA compliance - allows keyboard users to skip navigation

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkipToContentProps {
  /** Target element ID to skip to */
  targetId?: string
  /** Custom label for the skip link */
  label?: string
  /** CSS class name */
  className?: string
}

/**
 * SkipToContent component
 * Provides a "Skip to main content" link for keyboard users and screen readers
 * The link is hidden until focused, meeting WCAG 2.1 AA 2.4.1 criteria
 *
 * @example
 * ```tsx
 * <SkipToContent targetId="main-content" />
 * <main id="main-content">...</main>
 * ```
 */
export function SkipToContent({
  targetId = 'main-content',
  label = 'Pular para o conteudo principal',
  className,
}: SkipToContentProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      // Set focus to the target element
      target.setAttribute('tabindex', '-1')
      target.focus()

      // Remove tabindex after blur to avoid affecting normal navigation
      const handleBlur = () => {
        target.removeAttribute('tabindex')
        target.removeEventListener('blur', handleBlur)
      }
      target.addEventListener('blur', handleBlur)

      // Scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        // AIDEV-NOTE: Hidden by default, visible on focus for keyboard users
        'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4',
        'focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      {label}
    </a>
  )
}

/**
 * Skip link for multiple targets
 * Allows keyboard users to jump to different sections
 */
interface SkipLinksProps {
  /** Array of skip link targets */
  links: Array<{
    id: string
    label: string
  }>
  /** CSS class name */
  className?: string
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <nav
      aria-label="Navegacao rapida"
      className={cn(
        'sr-only focus-within:not-sr-only focus-within:absolute focus-within:left-4 focus-within:top-4',
        'focus-within:z-50 focus-within:flex focus-within:flex-col focus-within:gap-2',
        'focus-within:p-2 focus-within:bg-background focus-within:rounded-md',
        'focus-within:shadow-lg focus-within:border focus-within:border-border',
        className
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <span className="text-xs font-medium text-muted-foreground px-2 py-1">
        Pular para:
      </span>
      {links.map((link) => (
        <SkipToContent
          key={link.id}
          targetId={link.id}
          label={link.label}
          className="!static !auto"
        />
      ))}
    </nav>
  )
}

/**
 * Target component to mark skip-able content areas
 * Use this to wrap main content areas that should be reachable via skip links
 */
interface SkipTargetProps {
  /** ID for the target (must match the targetId in SkipToContent) */
  id?: string
  /** Child content */
  children: React.ReactNode
  /** CSS class name */
  className?: string
}

export function SkipTarget({
  id = 'main-content',
  children,
  className,
}: SkipTargetProps) {
  return (
    <div id={id} tabIndex={-1} className={className}>
      {children}
    </div>
  )
}

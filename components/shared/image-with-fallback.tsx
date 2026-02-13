// TASK-041: Image with fallback placeholder
// AIDEV-NOTE: Shows placeholder when image fails to load or is missing

"use client"

import * as React from "react"
import { ImageIcon, Package, User, Store, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type FallbackType = "generic" | "product" | "category" | "user" | "store"

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined
  alt: string
  fallbackType?: FallbackType
  fallbackClassName?: string
  containerClassName?: string
  showIcon?: boolean
  onLoadedChange?: (loaded: boolean) => void
}

// AIDEV-NOTE: Get icon component based on fallback type (outside render)
const FALLBACK_ICONS: Record<FallbackType, LucideIcon> = {
  product: Package,
  category: Store,
  user: User,
  store: Store,
  generic: ImageIcon,
}

export function ImageWithFallback({
  src,
  alt,
  fallbackType = "generic",
  fallbackClassName,
  containerClassName,
  showIcon = true,
  onLoadedChange,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // AIDEV-NOTE: Get icon outside of render to avoid component creation during render
  const FallbackIcon = FALLBACK_ICONS[fallbackType] || FALLBACK_ICONS.generic

  // AIDEV-NOTE: Handle image load success
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoadedChange?.(true)
  }

  // AIDEV-NOTE: Handle image load error
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onLoadedChange?.(false)
  }

  // AIDEV-NOTE: Reset error state when src changes
  React.useEffect(() => {
    if (src) {
      setHasError(false)
      setIsLoading(true)
    }
  }, [src])

  // AIDEV-NOTE: Render fallback placeholder
  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted",
          containerClassName
        )}
        role="img"
        aria-label={alt}
      >
        {showIcon && (
          <FallbackIcon
            className={cn(
              "text-muted-foreground",
              fallbackClassName || "h-8 w-8"
            )}
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- Native img used for dynamic external sources */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        // TASK-067: Added loading="lazy" for performance
        loading="lazy"
        className={cn(
          "object-cover",
          isLoading && "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  )
}

// AIDEV-NOTE: Avatar variant for user images
interface AvatarWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function AvatarWithFallback({
  src,
  alt,
  className,
  size = "md",
}: AvatarWithFallbackProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fallbackType="user"
      containerClassName={cn(
        "rounded-full bg-muted overflow-hidden",
        sizeClasses[size],
        className
      )}
      fallbackClassName={iconSizes[size]}
      className="h-full w-full"
    />
  )
}

// AIDEV-NOTE: Product image variant
interface ProductImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
}

export function ProductImageWithFallback({
  src,
  alt,
  className,
}: ProductImageWithFallbackProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fallbackType="product"
      containerClassName={cn("rounded-lg bg-muted overflow-hidden", className)}
      className="h-full w-full"
    />
  )
}

// AIDEV-NOTE: Category image variant
interface CategoryImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
}

export function CategoryImageWithFallback({
  src,
  alt,
  className,
}: CategoryImageWithFallbackProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fallbackType="category"
      containerClassName={cn("rounded-lg bg-muted overflow-hidden", className)}
      className="h-full w-full"
    />
  )
}

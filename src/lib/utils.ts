import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// AIDEV-NOTE: Utility function to merge Tailwind CSS classes conditionally
// Uses clsx for conditional classes and tailwind-merge to resolve conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AIDEV-NOTE: Format currency values for Brazilian Real (BRL)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// AIDEV-NOTE: Format phone numbers for Brazilian format
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// AIDEV-NOTE: Slugify text for URL-friendly strings
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim()
}

// AIDEV-NOTE: Generate a random ID for temporary use
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// AIDEV-NOTE: Debounce function for performance optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

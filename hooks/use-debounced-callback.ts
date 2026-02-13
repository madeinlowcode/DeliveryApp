'use client'

// AIDEV-PERF: Debounce hook for performance optimization
// Particularly useful for drag-and-drop and other frequent events

import { useCallback, useRef, useEffect, useState } from 'react'

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  ) as T

  return debouncedCallback
}

/**
 * Custom hook for throttling function calls
 * Useful when you want to limit calls but not wait until events stop
 * @param callback - The function to throttle
 * @param delay - Minimum delay between calls in milliseconds
 * @returns Throttled function
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay = 300
): T {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current

      if (timeSinceLastCall >= delay) {
        // Execute immediately
        lastCallRef.current = now
        callbackRef.current(...args)
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now()
          callbackRef.current(...args)
        }, delay - timeSinceLastCall)
      }
    },
    [delay]
  ) as T

  return throttledCallback
}

/**
 * Hook for debouncing a value (useful for search inputs)
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for debouncing drag-and-drop position updates
 * Specifically optimized for @dnd-kit usage
 * @param onPositionChange - Callback when position changes
 * @param delay - Delay in milliseconds (default: 300ms for drag-and-drop)
 */
export function useDebouncedDragUpdate<T extends { id: string; position: number }>(
  onPositionChange: (items: T[]) => void | Promise<void>,
  delay = 300
): {
  handleDragEnd: (items: T[]) => void
  isPending: boolean
  cancel: () => void
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingRef = useRef<T[] | null>(null)
  const [isPending, setIsPending] = useState(false)
  const callbackRef = useRef(onPositionChange)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onPositionChange
  }, [onPositionChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleDragEnd = useCallback(
    (items: T[]) => {
      // Store the pending update
      pendingRef.current = items
      setIsPending(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Schedule the update
      timeoutRef.current = setTimeout(() => {
        if (pendingRef.current) {
          callbackRef.current(pendingRef.current)
          pendingRef.current = null
          setIsPending(false)
        }
      }, delay)
    },
    [delay]
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingRef.current = null
    setIsPending(false)
  }, [])

  return {
    handleDragEnd,
    isPending,
    cancel,
  }
}

/**
 * Hook for debouncing form field updates
 * Useful for auto-save functionality
 */
export function useDebouncedFormField<T>(
  value: T,
  onUpdate: (value: T) => void | Promise<void>,
  delay = 500
): {
  localValue: T
  setLocalValue: (value: T) => void
  isPending: boolean
  flush: () => void
} {
  const [localValue, setLocalValueState] = useState(value)
  const [isPending, setIsPending] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(onUpdate)
  const localValueRef = useRef(value)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValueState(value)
    localValueRef.current = value
  }, [value])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const setLocalValue = useCallback(
    (newValue: T) => {
      setLocalValueState(newValue)
      localValueRef.current = newValue
      setIsPending(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(localValueRef.current)
        setIsPending(false)
      }, delay)
    },
    [delay]
  )

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (isPending) {
      callbackRef.current(localValueRef.current)
      setIsPending(false)
    }
  }, [isPending])

  return {
    localValue,
    setLocalValue,
    isPending,
    flush,
  }
}

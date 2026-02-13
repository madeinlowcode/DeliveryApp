'use client'

// AIDEV-NOTE: Hook to generate and persist chat session ID for customer chat
// Persists to localStorage for cross-page continuity

import { useEffect, useState } from 'react'

const SESSION_STORAGE_KEY = 'customer_chat_session_id'
const SESSION_LENGTH = 36 // UUID v4 length

/**
 * Generates a UUID v4 for session identification
 */
function generateSessionId(): string {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Hook for managing customer chat session ID
 * @returns Session ID string
 */
export function useChatSession(): string {
  const [sessionId, setSessionId] = useState<string>(() => {
    // Initialize from localStorage or generate new
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (stored && stored.length === SESSION_LENGTH) {
        return stored
      }
    }
    return generateSessionId()
  })

  // Persist session ID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    }
  }, [sessionId])

  return sessionId
}

/**
 * Hook variant that returns session ID and reset function
 * Useful for testing or manual session management
 */
export function useChatSessionWithReset(): {
  sessionId: string
  resetSession: () => void
} {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (stored && stored.length === SESSION_LENGTH) {
        return stored
      }
    }
    return generateSessionId()
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    }
  }, [sessionId])

  const resetSession = () => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
  }

  return { sessionId, resetSession }
}

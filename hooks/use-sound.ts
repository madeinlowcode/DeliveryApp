"use client"

// TASK-055: Sound hook for notification audio
// AIDEV-NOTE: Hook for playing audio notifications (new orders, alerts)

import { useCallback, useRef, useEffect, useState } from "react"

interface UseSoundOptions {
  volume?: number
  loop?: boolean
  preload?: boolean
}

interface UseSoundReturn {
  play: () => void
  stop: () => void
  pause: () => void
  isPlaying: boolean
  isLoaded: boolean
  error: Error | null
}

// AIDEV-NOTE: Custom hook for playing sound effects
export function useSound(
  src: string,
  options: UseSoundOptions = {}
): UseSoundReturn {
  const { volume = 1, loop = false, preload = true } = options

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // AIDEV-NOTE: Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return

    const audio = new Audio(src)
    audio.volume = Math.min(1, Math.max(0, volume))
    audio.loop = loop
    audio.preload = preload ? "auto" : "none"

    audio.addEventListener("canplaythrough", () => {
      setIsLoaded(true)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
    })

    audio.addEventListener("error", (e) => {
      // AIDEV-NOTE: Graceful fallback for missing audio files - don't break the app
      const errorMsg = `Failed to load audio: ${src}`
      setError(new Error(errorMsg))
      // Only log in development for debugging
      if (process.env.NODE_ENV === "development") {
        console.warn("Audio load error (non-critical):", errorMsg)
      }
    })

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, [src, volume, loop, preload])

  // AIDEV-NOTE: Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, volume))
    }
  }, [volume])

  // AIDEV-NOTE: Play the sound with graceful fallback
  const play = useCallback(() => {
    if (!audioRef.current) return

    // AIDEV-NOTE: Don't play if audio failed to load (missing file)
    if (error && !isLoaded) {
      // Silently skip playing audio if it failed to load
      return
    }

    // Reset to start if already playing
    audioRef.current.currentTime = 0

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch((err) => {
        // Handle autoplay restrictions gracefully
        if (process.env.NODE_ENV === "development") {
          console.warn("Audio play failed (non-critical):", err.message)
        }
        setError(err instanceof Error ? err : new Error("Failed to play audio"))
      })
  }, [error, isLoaded])

  // AIDEV-NOTE: Stop the sound
  const stop = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }, [])

  // AIDEV-NOTE: Pause the sound
  const pause = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  return {
    play,
    stop,
    pause,
    isPlaying,
    isLoaded,
    error,
  }
}

// AIDEV-NOTE: Hook specifically for notification sounds with browser permission handling
export function useNotificationSound(src: string = "/sounds/notification.mp3") {
  const { play, ...rest } = useSound(src, { volume: 0.5 })
  const hasInteractedRef = useRef(false)

  // AIDEV-NOTE: Track user interaction to enable sound (browser autoplay policy)
  useEffect(() => {
    const handleInteraction = () => {
      hasInteractedRef.current = true
      // Remove listeners after first interaction
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }

    document.addEventListener("click", handleInteraction)
    document.addEventListener("keydown", handleInteraction)

    return () => {
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  // AIDEV-NOTE: Only play if user has interacted with the page
  const playIfAllowed = useCallback(() => {
    if (hasInteractedRef.current) {
      play()
    }
  }, [play])

  return {
    play: playIfAllowed,
    ...rest,
  }
}

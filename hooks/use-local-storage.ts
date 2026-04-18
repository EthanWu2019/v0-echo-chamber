"use client"

import { useState, useEffect, useCallback } from "react"
import type { Post, DirectMessage, Achievement, BlockedUser } from "@/lib/types"
import type { Language } from "@/lib/i18n"

const STORAGE_KEY = "echochamber_session"

export interface SessionData {
  lang: Language
  posts: Post[]
  sentiment: number
  totalNegativeComments: number
  directMessages: DirectMessage[]
  blockedUsers: BlockedUser[]
  unlockedAchievements: Achievement[]
  dayCount: number
  firstFlamed: boolean
  sentimentCrashed: boolean
  sentimentRecovered: boolean
  savedAt: string
}

// Convert Date objects to strings for storage
function serializeSessionData(data: Partial<SessionData>): string {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  })
}

// Convert strings back to Date objects
function deserializeSessionData(json: string): SessionData | null {
  try {
    return JSON.parse(json, (key, value) => {
      if (value && typeof value === "object" && value.__type === "Date") {
        return new Date(value.value)
      }
      return value
    })
  } catch {
    return null
  }
}

export function useLocalStorage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasSavedData, setHasSavedData] = useState(false)

  // Check if there's saved data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      setHasSavedData(!!saved)
      setIsLoaded(true)
    }
  }, [])

  // Save session data
  const saveSession = useCallback((data: Omit<SessionData, "savedAt">) => {
    if (typeof window === "undefined") return

    const sessionData: SessionData = {
      ...data,
      savedAt: new Date().toISOString()
    }

    try {
      localStorage.setItem(STORAGE_KEY, serializeSessionData(sessionData))
      setHasSavedData(true)
    } catch (error) {
      console.error("[v0] Failed to save session:", error)
    }
  }, [])

  // Load session data
  const loadSession = useCallback((): SessionData | null => {
    if (typeof window === "undefined") return null

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return null
      return deserializeSessionData(saved)
    } catch (error) {
      console.error("[v0] Failed to load session:", error)
      return null
    }
  }, [])

  // Clear session data
  const clearSession = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(STORAGE_KEY)
      setHasSavedData(false)
    } catch (error) {
      console.error("[v0] Failed to clear session:", error)
    }
  }, [])

  // Get saved time
  const getSavedTime = useCallback((): Date | null => {
    const session = loadSession()
    if (!session) return null
    return new Date(session.savedAt)
  }, [loadSession])

  return {
    isLoaded,
    hasSavedData,
    saveSession,
    loadSession,
    clearSession,
    getSavedTime
  }
}

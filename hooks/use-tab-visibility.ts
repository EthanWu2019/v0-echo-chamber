"use client"

import { useEffect, useRef } from "react"
import type { Language } from "@/lib/i18n"

const AWAY_TITLES_ZH = [
  "网友们都在等你回来...",
  "抽象网友喊你回来看评论!",
  "你的帖子被喷了，快回来!",
  "互联网真是无奇不有...",
  "有人在私信骂你!",
  "你的舆情正在崩盘...",
  "快回来看看发生了什么!",
  "魔幻互联网等你探索~",
]

const AWAY_TITLES_EN = [
  "Your fans miss you...",
  "Haters are waiting for you!",
  "Your post went viral!",
  "The internet is wild...",
  "Someone DMed you!",
  "Your reputation is tanking...",
  "Come back to see what happened!",
  "The chaotic internet awaits~",
]

export function useTabVisibility(lang: Language) {
  const originalTitle = useRef<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const titleIndex = useRef(0)

  useEffect(() => {
    // Store original title
    originalTitle.current = document.title

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab - start cycling through away messages
        const titles = lang === "zh" ? AWAY_TITLES_ZH : AWAY_TITLES_EN
        titleIndex.current = Math.floor(Math.random() * titles.length)
        document.title = titles[titleIndex.current]

        // Cycle through messages every 3 seconds
        intervalRef.current = setInterval(() => {
          titleIndex.current = (titleIndex.current + 1) % titles.length
          document.title = titles[titleIndex.current]
        }, 3000)
      } else {
        // User came back - restore original title
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        document.title = originalTitle.current
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [lang])

  // Update original title when it changes
  useEffect(() => {
    if (!document.hidden) {
      originalTitle.current = document.title
    }
  }, [])
}

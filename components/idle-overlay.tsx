"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Language, Translations } from "@/lib/i18n"

interface IdleOverlayProps {
  timeout?: number // in milliseconds
  onResume: () => void
  onIdle?: () => void
  lang: Language
  t: Translations
}

const IDLE_MESSAGES_ZH = [
  "你还在吗？",
  "等你回来~",
  "休息一下也好",
  "互联网暂时安静了",
  "喝口水？",
  "别走太久，评论区等你回来",
  "暂停中...",
  "你的账号在等你",
]

const IDLE_MESSAGES_EN = [
  "Still there?",
  "Waiting for you~",
  "Taking a break?",
  "The internet is quiet for now",
  "Grab some water?",
  "Don't be gone too long, comments await",
  "Paused...",
  "Your account misses you",
]

export function IdleOverlay({ 
  timeout = 120000, // 2 minutes default
  onResume,
  onIdle,
  lang,
  t 
}: IdleOverlayProps) {
  const [isIdle, setIsIdle] = useState(false)
  const [idleMessage, setIdleMessage] = useState("")
  
  // Stable callback refs to avoid dependency array size changes
  const onIdleRef = useCallback(() => {
    onIdle?.()
  }, [onIdle])
  
  const resetTimer = useCallback(() => {
    if (isIdle) {
      setIsIdle(false)
      onResume()
    }
  }, [isIdle, onResume])

  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const handleActivity = () => {
      // Only respond to "real" activity - clicks, key presses, scroll, touch
      clearTimeout(idleTimer)
      
      if (isIdle) {
        resetTimer()
      } else {
        idleTimer = setTimeout(() => {
          const messages = lang === "zh" ? IDLE_MESSAGES_ZH : IDLE_MESSAGES_EN
          setIdleMessage(messages[Math.floor(Math.random() * messages.length)])
          setIsIdle(true)
          onIdleRef()
        }, timeout)
      }
    }

    // Track meaningful interactions only (not mouse movement)
    const events = ["click", "keydown", "scroll", "touchstart", "wheel"]
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Start the initial timer
    idleTimer = setTimeout(() => {
      const messages = lang === "zh" ? IDLE_MESSAGES_ZH : IDLE_MESSAGES_EN
      setIdleMessage(messages[Math.floor(Math.random() * messages.length)])
      setIsIdle(true)
      onIdleRef()
    }, timeout)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearTimeout(idleTimer)
    }
  }, [timeout, lang, isIdle, resetTimer, onIdleRef])

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center"
          onClick={resetTimer}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="text-center space-y-8 max-w-md px-6"
          >
            {/* Animated circles */}
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary/20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-4 border-primary/30"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border-4 border-primary/40"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  💤
                </motion.span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                {idleMessage}
              </h2>
              <p className="text-muted-foreground">
                {lang === "zh" 
                  ? "点击任意位置继续体验互联网百态" 
                  : "Click anywhere to continue experiencing the internet"
                }
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              {lang === "zh" ? "我回来了" : "I'm back"}
            </motion.button>

            <p className="text-xs text-muted-foreground/60">
              {lang === "zh" 
                ? "（闲置时自动暂停，节省资源）" 
                : "(Auto-paused when idle to save resources)"
              }
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to use idle state in parent component
export function useIdleState(timeout = 120000) {
  const [isPaused, setIsPaused] = useState(false)
  
  const handleResume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const handlePause = useCallback(() => {
    setIsPaused(true)
  }, [])

  return { isPaused, handleResume, handlePause }
}

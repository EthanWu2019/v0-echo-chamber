"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Language, Translations } from "@/lib/i18n"

interface ScreenSizeGuardProps {
  lang: Language
  t: Translations
  children: React.ReactNode
  onStubbornUnlock?: () => void
}

export function ScreenSizeGuard({ lang, t, children, onStubbornUnlock }: ScreenSizeGuardProps) {
  const [clickCount, setClickCount] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [hasUnlockedAchievement, setHasUnlockedAchievement] = useState(false)
  
  const maxClicks = 8
  const minScale = 0.3
  
  // Calculate button scale based on click count
  const buttonScale = Math.max(minScale, 1 - (clickCount * 0.09))
  
  // Generate question marks based on click count
  const questionMarks = "？".repeat(Math.min(clickCount, 10))
  
  const getButtonText = () => {
    if (clickCount === 0) {
      return lang === "zh" ? "我硬要看！" : "Let me in anyway!"
    }
    if (clickCount >= maxClicks) {
      return lang === "zh" ? "行吧..." : "Fine..."
    }
    return lang === "zh" ? `还点${questionMarks}` : `Still clicking${questionMarks.replace(/？/g, "?")}`
  }
  
  const handleClick = () => {
    if (clickCount >= maxClicks) {
      setDismissed(true)
      if (!hasUnlockedAchievement && onStubbornUnlock) {
        onStubbornUnlock()
        setHasUnlockedAchievement(true)
      }
    } else {
      setClickCount(prev => prev + 1)
    }
  }

  // Check if already dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("screenGuardDismissed")
    if (wasDismissed === "true") {
      setDismissed(true)
    }
  }, [])

  useEffect(() => {
    if (dismissed) {
      sessionStorage.setItem("screenGuardDismissed", "true")
    }
  }, [dismissed])

  if (dismissed) {
    return <>{children}</>
  }

  return (
    <>
      {/* Mobile/Tablet Block Screen */}
      <div className="lg:hidden fixed inset-0 z-[9999] bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden"
            animate={{ rotate: clickCount > 0 ? [0, -5, 5, -5, 0] : 0 }}
            transition={{ duration: 0.3 }}
          >
            <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          
          <h1 className="text-xl font-semibold text-foreground mb-3">
            {lang === "zh" ? "你屏幕好窄啊" : "Your screen is too narrow"}
          </h1>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {lang === "zh" 
              ? "东西太多塞不下，建议用电脑看哦~"
              : "Too much stuff to fit in here. Try a desktop!"
            }
          </p>
          
          <AnimatePresence mode="wait">
            <motion.button
              key={clickCount}
              onClick={handleClick}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium transition-colors hover:bg-primary/90"
              style={{ 
                transform: `scale(${buttonScale})`,
                transformOrigin: "center"
              }}
              initial={{ scale: buttonScale * 0.9, opacity: 0.8 }}
              animate={{ scale: buttonScale, opacity: 1 }}
              whileTap={{ scale: buttonScale * 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {getButtonText()}
            </motion.button>
          </AnimatePresence>
          
          {clickCount > 0 && clickCount < maxClicks && (
            <motion.p 
              className="mt-4 text-xs text-muted-foreground/60"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {lang === "zh" 
                ? `再点 ${maxClicks - clickCount} 次...` 
                : `${maxClicks - clickCount} more clicks...`
              }
            </motion.p>
          )}
          
          {clickCount >= maxClicks && (
            <motion.p 
              className="mt-4 text-xs text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {lang === "zh" 
                ? "服了你了，点进去吧" 
                : "Okay okay, you win"
              }
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Desktop Content */}
      <div className="hidden lg:block">
        {children}
      </div>
    </>
  )
}

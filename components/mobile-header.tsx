"use client"

import { Radio, Sun, Moon, Globe, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import type { Language, Translations } from "@/lib/i18n"

interface MobileHeaderProps {
  lang: Language
  t: Translations
  isDarkMode: boolean
  onThemeToggle: () => void
  onLanguageSwitch: () => void
  dayCount: number
  sentiment: number
}

export function MobileHeader({ 
  lang,
  t,
  isDarkMode,
  onThemeToggle,
  onLanguageSwitch,
  dayCount,
  sentiment
}: MobileHeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  
  const sentimentColor = sentiment >= 70 ? "text-green-400" : sentiment >= 40 ? "text-yellow-400" : "text-red-400"
  
  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-5 h-5 text-red-500" />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              EchoChamber
            </span>
          </div>

          {/* Stats & Settings */}
          <div className="flex items-center gap-3">
            {/* Day Counter */}
            <div className="text-xs">
              <span className="text-muted-foreground">{t.dayCount}: </span>
              <span className="font-bold text-purple-400">{dayCount}</span>
            </div>

            {/* Sentiment Mini */}
            <div className={`text-xs font-bold ${sentimentColor}`}>
              {sentiment}%
            </div>

            {/* Settings Button */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-14 bg-card border border-border rounded-xl shadow-lg p-2 z-50"
          >
            <button
              onClick={() => {
                onThemeToggle()
                setShowSettings(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {isDarkMode ? t.darkMode : t.lightMode}
            </button>
            <button
              onClick={() => {
                onLanguageSwitch()
                setShowSettings(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              <Globe className="w-4 h-4" />
              {t.switchLanguage}
            </button>
          </motion.div>
        )}
      </header>

      {/* Backdrop for settings */}
      {showSettings && (
        <div 
          className="lg:hidden fixed inset-0 z-30" 
          onClick={() => setShowSettings(false)}
        />
      )}
    </>
  )
}

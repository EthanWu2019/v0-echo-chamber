"use client"

import { Home, Bell, User, Radio, Globe, Sun, Moon, Mail, Trophy, Zap, HardDrive } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Language, Translations } from "@/lib/i18n"

interface SidebarProps {
  notificationCount: number
  dmCount?: number
  onNavClick?: (label: string) => void
  activeNav?: string
  lang: Language
  t: Translations
  onLanguageSwitch: () => void
  isDarkMode: boolean
  onThemeToggle: (event?: React.MouseEvent) => void
  onOpenDM?: () => void
  onOpenAchievements?: () => void
  onOpenStoryMode?: () => void
  dayCount?: number
  hasSavedData?: boolean
  onSaveData?: () => void
  onClearData?: () => void
  lastSavedTime?: Date | null
}

export function Sidebar({ 
  notificationCount,
  dmCount = 0,
  onNavClick, 
  activeNav, 
  lang,
  t,
  onLanguageSwitch,
  isDarkMode,
  onThemeToggle,
  onOpenDM,
  onOpenAchievements,
  onOpenStoryMode,
  dayCount = 1,
  hasSavedData = false,
  onSaveData,
  onClearData,
  lastSavedTime
}: SidebarProps) {
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-[275px] border-r border-border bg-background px-3 py-4 flex flex-col">
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2.5 py-2">
          <div className="relative">
            <Radio className="w-7 h-7 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          <span className="text-xl font-bold text-foreground">EchoChamber</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1">
        {/* Home */}
        <button
          onClick={() => onNavClick?.(t.home)}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors
            ${activeNav === t.home 
              ? "bg-foreground/10 font-semibold" 
              : "hover:bg-foreground/5"
            }`}
        >
          <Home className={`w-[26px] h-[26px] ${activeNav === t.home ? "stroke-[2.5]" : ""}`} />
          <span className="text-xl">{t.home}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => onNavClick?.(t.notifications)}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors
            ${activeNav === t.notifications 
              ? "bg-foreground/10 font-semibold" 
              : "hover:bg-foreground/5"
            }`}
        >
          <div className="relative w-[26px] h-[26px]">
            <Bell className={`w-[26px] h-[26px] ${activeNav === t.notifications ? "stroke-[2.5]" : ""}`} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>
          <span className="text-xl">{t.notifications}</span>
        </button>

        {/* Messages */}
        <button
          onClick={onOpenDM}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors hover:bg-foreground/5"
        >
          <div className="relative w-[26px] h-[26px]">
            <Mail className="w-[26px] h-[26px]" />
            {dmCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {dmCount > 99 ? "99+" : dmCount}
              </span>
            )}
          </div>
          <span className="text-xl">{t.messages}</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavClick?.(t.profile)}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors
            ${activeNav === t.profile 
              ? "bg-foreground/10 font-semibold" 
              : "hover:bg-foreground/5"
            }`}
        >
          <User className={`w-[26px] h-[26px] ${activeNav === t.profile ? "stroke-[2.5]" : ""}`} />
          <span className="text-xl">{t.profile}</span>
        </button>

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-border/50" />

        {/* Story Mode */}
        <button
          onClick={onOpenStoryMode}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors hover:bg-foreground/5"
        >
          <Zap className="w-[26px] h-[26px]" />
          <span className="text-xl">{t.storyMode}</span>
        </button>

        {/* Achievements */}
        <button
          onClick={onOpenAchievements}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors hover:bg-foreground/5"
        >
          <Trophy className="w-[26px] h-[26px]" />
          <span className="text-xl">{t.achievements}</span>
        </button>
      </nav>

      {/* Bottom Section */}
      <div className="space-y-1">
        {/* Day Counter */}
        <div className="px-3 py-2 mb-2">
          <div className="text-sm text-muted-foreground">{t.dayCount}</div>
          <div className="text-2xl font-bold">{dayCount} <span className="text-sm font-normal text-muted-foreground">{t.days}</span></div>
        </div>

        {/* Session Save */}
        <button
          onClick={onSaveData}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-full transition-colors hover:bg-foreground/5 group"
        >
          <HardDrive className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          <div className="flex-1 text-left">
            <span className="text-sm">{t.saveProgress}</span>
            {lastSavedTime && (
              <p className="text-xs text-muted-foreground">
                {t.lastSaved}: {lastSavedTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </button>

        {/* Clear Data - Only show if has saved data */}
        {hasSavedData && (
          <button
            onClick={onClearData}
            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-full transition-colors hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
          >
            <span className="w-5 h-5 flex items-center justify-center text-xs">×</span>
            <span className="text-sm">{t.clearProgress}</span>
          </button>
        )}

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-border/50" />

        {/* Theme Toggle */}
        <button
          onClick={(e) => onThemeToggle(e)}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-full transition-colors hover:bg-foreground/5"
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Moon className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Sun className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-sm text-muted-foreground">{isDarkMode ? t.darkMode : t.lightMode}</span>
        </button>
        
        {/* Language Switch */}
        <button
          onClick={onLanguageSwitch}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-full transition-colors hover:bg-foreground/5"
        >
          <Globe className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t.switchLanguage}</span>
        </button>
      </div>

      {/* Copyright */}
      <div className="px-3 pt-3 mt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground/50">
          © 2024 Chengze Wu
        </p>
      </div>
    </aside>
  )
}

"use client"

import { Home, Bell, User, Radio, Globe, Sun, Moon, Mail, Trophy, Zap, Save, Trash2 } from "lucide-react"
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
  const navItems = [
    { icon: Home, label: t.home, key: "home" },
    { icon: Bell, label: t.notifications, hasNotification: true, notifCount: notificationCount, key: "notifications" },
    { icon: User, label: t.profile, key: "profile" },
  ]

  const actionItems = [
    { icon: Mail, label: t.messages, onClick: onOpenDM, count: dmCount },
    { icon: Trophy, label: t.achievements, onClick: onOpenAchievements },
    { icon: Zap, label: t.storyMode, onClick: onOpenStoryMode },
  ]
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Radio className="w-8 h-8 text-red-500" />
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          EchoChamber
        </span>
      </div>

      {/* Day Counter */}
      <div className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
        <p className="text-xs text-muted-foreground">{t.dayCount}</p>
        <p className="text-2xl font-bold text-purple-400">
          {dayCount} <span className="text-sm font-normal text-muted-foreground">{t.days}</span>
        </p>
      </div>

      {/* Data Management - Session Save */}
      <div className="mb-6 p-3 bg-secondary/30 rounded-xl border border-border">
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t.sessionData}</p>
        <div className="flex gap-2">
          <button
            onClick={onSaveData}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all text-xs font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            {t.saveData}
          </button>
          <button
            onClick={onClearData}
            disabled={!hasSavedData}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearData}
          </button>
        </div>
        {lastSavedTime && (
          <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">
            {t.lastSaved}: {lastSavedTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavClick?.(item.label)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
              ${activeNav === item.label 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              <AnimatePresence>
                {item.hasNotification && item.notifCount && item.notifCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold text-white relative z-10">
                      {item.notifCount > 9 ? "9+" : item.notifCount}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-base font-medium">{item.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Action Items */}
        {actionItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.count && item.count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-white">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-base font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Theme and Language Buttons */}
      <div className="mb-4 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={(e) => onThemeToggle(e)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-base font-medium">
            {isDarkMode ? t.darkMode : t.lightMode}
          </span>
        </button>
        
        {/* Language Switch */}
        <button
          onClick={onLanguageSwitch}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
        >
          <Globe className="w-6 h-6" />
          <span className="text-base font-medium">{t.switchLanguage}</span>
        </button>
        <p className="text-xs text-muted-foreground/60 px-4 mt-1">
          {t.languageWarning}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </aside>
  )
}

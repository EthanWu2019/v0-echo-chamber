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
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-56 xl:w-64 border-r border-border bg-card p-4 xl:p-5 flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative shrink-0">
          <Radio className="w-6 h-6 xl:w-7 xl:h-7 text-red-500" />
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-lg xl:text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          EchoChamber
        </span>
      </div>

      {/* Day Counter + Session Save - Compact */}
      <div className="mb-3 p-2 xl:p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] xl:text-xs text-muted-foreground">{t.dayCount}</p>
            <p className="text-xl xl:text-2xl font-bold text-purple-400">
              {dayCount} <span className="text-xs font-normal text-muted-foreground">{t.days}</span>
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSaveData}
              className="p-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all"
              title={t.saveData}
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClearData}
              disabled={!hasSavedData}
              className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
              title={t.clearData}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {lastSavedTime && (
          <p className="text-[9px] xl:text-[10px] text-muted-foreground/60 text-center">
            {t.lastSaved}: {lastSavedTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Navigation - Compact */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavClick?.(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
              ${activeNav === item.label 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
          >
            <div className="relative shrink-0">
              <item.icon className="w-5 h-5" />
              <AnimatePresence>
                {item.hasNotification && item.notifCount && item.notifCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-white">
                      {item.notifCount > 9 ? "9+" : item.notifCount}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-sm font-medium truncate">{item.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="my-2 border-t border-border" />

        {/* Action Items */}
        {actionItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
          >
            <div className="relative shrink-0">
              <item.icon className="w-5 h-5" />
              {item.count && item.count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-white">
                    {item.count > 9 ? "+" : item.count}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-sm font-medium truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions - Compact */}
      <div className="space-y-1 pt-2 border-t border-border">
        {/* Theme Toggle */}
        <button
          onClick={(e) => onThemeToggle(e)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
        >
          {isDarkMode ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0" />}
          <span className="text-sm truncate">{isDarkMode ? t.darkMode : t.lightMode}</span>
        </button>
        
        {/* Language Switch */}
        <button
          onClick={onLanguageSwitch}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="text-sm truncate">{t.switchLanguage}</span>
        </button>
      </div>

      {/* Disclaimer - Minimal */}
      <div className="pt-2 mt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground/60 leading-tight line-clamp-2">
          {t.disclaimer}
        </p>
      </div>
    </aside>
  )
}

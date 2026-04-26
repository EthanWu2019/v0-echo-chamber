"use client"

import { Home, Bell, User, Mail, Trophy, Zap, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import type { Language, Translations } from "@/lib/i18n"

interface MobileNavProps {
  notificationCount: number
  dmCount?: number
  onNavClick?: (label: string) => void
  activeNav?: string
  lang: Language
  t: Translations
  onOpenDM?: () => void
  onOpenAchievements?: () => void
  onOpenStoryMode?: () => void
}

export function MobileNav({ 
  notificationCount,
  dmCount = 0,
  onNavClick, 
  activeNav, 
  t,
  onOpenDM,
  onOpenAchievements,
  onOpenStoryMode,
}: MobileNavProps) {
  const [showMore, setShowMore] = useState(false)
  
  const mainItems = [
    { icon: Home, label: t.home, key: "home", onClick: () => onNavClick?.(t.home) },
    { icon: Bell, label: t.notifications, key: "notifications", count: notificationCount, onClick: () => onNavClick?.(t.notifications) },
    { icon: User, label: t.profile, key: "profile", onClick: () => onNavClick?.(t.profile) },
  ]

  const moreItems = [
    { icon: Mail, label: t.messages, onClick: onOpenDM, count: dmCount },
    { icon: Trophy, label: t.achievements, onClick: onOpenAchievements },
    { icon: Zap, label: t.storyMode, onClick: onOpenStoryMode },
  ]
  
  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50">
        {mainItems.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
              activeNav === item.label 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.count && item.count > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
        
        {/* More Button */}
        <button
          onClick={() => setShowMore(true)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-muted-foreground"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {dmCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px]">{t.more || "More"}</span>
        </button>
      </nav>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t.more || "More"}</h3>
                <button onClick={() => setShowMore(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {moreItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick?.()
                      setShowMore(false)
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all"
                  >
                    <div className="relative">
                      <item.icon className="w-6 h-6" />
                      {item.count && item.count > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">
                            {item.count > 9 ? "+" : item.count}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

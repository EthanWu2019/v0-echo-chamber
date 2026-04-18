"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Lock } from "lucide-react"
import { ACHIEVEMENTS, type Achievement } from "@/lib/types"
import type { Translations, Language } from "@/lib/i18n"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

interface AchievementsPanelProps {
  isOpen: boolean
  onClose: () => void
  unlockedAchievements: Achievement[]
  t: Translations
  lang: Language
}

export function AchievementsPanel({ 
  isOpen, 
  onClose, 
  unlockedAchievements,
  t, 
  lang 
}: AchievementsPanelProps) {
  const dateLocale = lang === "zh" ? zhCN : enUS
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id))
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-card border border-border rounded-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="font-semibold">{t.achievementsTitle}</h2>
                <span className="text-sm text-muted-foreground">
                  ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                </span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Achievements Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlockedIds.has(achievement.id)
                  const unlockedData = unlockedAchievements.find(a => a.id === achievement.id)
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition-all ${
                        isUnlocked 
                          ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30" 
                          : "bg-secondary/30 border-border opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                          isUnlocked ? "bg-yellow-500/20" : "bg-secondary"
                        }`}>
                          {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm ${isUnlocked ? "" : "text-muted-foreground"}`}>
                            {lang === "zh" ? achievement.titleZh : achievement.titleEn}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lang === "zh" ? achievement.descZh : achievement.descEn}
                          </p>
                          {isUnlocked && unlockedData?.unlockedAt && (
                            <p className="text-xs text-yellow-500 mt-2">
                              {formatDistanceToNow(unlockedData.unlockedAt, { locale: dateLocale, addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Achievement unlock toast
export function AchievementToast({ 
  achievement, 
  onClose,
  lang 
}: { 
  achievement: Achievement
  onClose: () => void
  lang: Language 
}) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 shadow-lg max-w-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-yellow-500/30 flex items-center justify-center text-2xl">
          {achievement.icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-yellow-500 font-medium">
            {lang === "zh" ? "解锁成就" : "Achievement Unlocked"}
          </p>
          <p className="font-semibold">
            {lang === "zh" ? achievement.titleZh : achievement.titleEn}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "zh" ? achievement.descZh : achievement.descEn}
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, Play } from "lucide-react"
import { STORY_SCENARIOS, type StoryScenario } from "@/lib/types"
import type { Translations, Language } from "@/lib/i18n"

interface StoryModePanelProps {
  isOpen: boolean
  onClose: () => void
  onStartScenario: (scenario: StoryScenario) => void
  t: Translations
  lang: Language
}

export function StoryModePanel({ 
  isOpen, 
  onClose, 
  onStartScenario,
  t, 
  lang 
}: StoryModePanelProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 bg-green-500/20"
      case "medium": return "text-yellow-400 bg-yellow-500/20"
      case "hard": return "text-red-400 bg-red-500/20"
      default: return "text-muted-foreground bg-secondary"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return lang === "zh" ? t.difficultyEasy : "Easy"
      case "medium": return lang === "zh" ? t.difficultyMedium : "Medium"
      case "hard": return lang === "zh" ? t.difficultyHard : "Hard"
      default: return difficulty
    }
  }

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[80vh] bg-card border border-border rounded-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                <h2 className="font-semibold">{t.storyModeTitle}</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20">
              <p className="text-sm text-purple-300">{t.storyModeDesc}</p>
            </div>

            {/* Scenarios */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-4">
                {STORY_SCENARIOS.map((scenario) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group"
                    onClick={() => onStartScenario(scenario)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-3xl shrink-0">
                        {scenario.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {lang === "zh" ? scenario.titleZh : scenario.titleEn}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                            {getDifficultyLabel(scenario.difficulty)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {lang === "zh" ? scenario.descZh : scenario.descEn}
                        </p>
                        <div className="mt-3 p-2 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {lang === "zh" ? "初始动态:" : "Initial post:"}
                          </p>
                          <p className="text-sm italic">
                            &quot;{lang === "zh" ? scenario.initialPost.zh : scenario.initialPost.en}&quot;
                          </p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

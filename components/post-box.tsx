"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { Translations } from "@/lib/i18n"

interface PostBoxProps {
  onPost: (content: string) => void
  isLoading?: boolean
  t: Translations
}

export function PostBox({ onPost, isLoading, t }: PostBoxProps) {
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (content.trim() && !isLoading) {
      onPost(content.trim())
      setContent("")
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* Warning Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4 px-3 py-2 bg-pink-500/10 border border-pink-500/30 rounded-lg"
      >
        <span className="text-base shrink-0">{t.catEmoji}</span>
        <p className="text-xs text-pink-400">
          {t.friendlyReminder}
        </p>
      </motion.div>

      {/* Input Area */}
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center">
          <span className="text-white font-bold">U</span>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.postPlaceholder}
            className="w-full bg-transparent resize-none text-foreground placeholder:text-muted-foreground outline-none min-h-[80px] text-base leading-relaxed"
            maxLength={280}
          />
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className={`text-sm ${content.length > 250 ? "text-red-400" : "text-muted-foreground"}`}>
              {content.length}/280
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-6 rounded-full min-w-[100px]"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {t.postButton}...
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.postButton}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

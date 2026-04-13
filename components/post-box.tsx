"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { motion } from "framer-motion"
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
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-6 rounded-full"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t.postButton}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

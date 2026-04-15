"use client"

import { useState } from "react"
import { Send, Shield, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { Translations } from "@/lib/i18n"

type ReviewPhase = "idle" | "reviewing" | "approved" | "posting"

interface PostBoxProps {
  onPost: (content: string) => void
  isLoading?: boolean
  reviewProgress?: number
  reviewPhase?: ReviewPhase
  t: Translations
}

export function PostBox({ onPost, isLoading, reviewProgress = 0, reviewPhase = "idle", t }: PostBoxProps) {
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (content.trim() && !isLoading) {
      onPost(content.trim())
      setContent("")
    }
  }

  const getReviewText = () => {
    if (reviewPhase === "reviewing") return t.reviewing || "Reviewing..."
    if (reviewPhase === "approved") return t.approved || "Approved!"
    if (reviewPhase === "posting") return t.posting || "Posting..."
    return t.postButton
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
            disabled={isLoading}
            className="w-full bg-transparent resize-none text-foreground placeholder:text-muted-foreground outline-none min-h-[80px] text-base leading-relaxed disabled:opacity-50"
            maxLength={280}
          />
          
          {/* Review Progress Bar */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      reviewPhase === "approved" 
                        ? "bg-green-500" 
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${reviewProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {reviewPhase === "reviewing" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Shield className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  )}
                  {reviewPhase === "approved" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </motion.div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {getReviewText()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
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
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                  >
                    {getReviewText()}
                  </motion.span>
                ) : (
                  <motion.div
                    key="normal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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

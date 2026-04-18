"use client"

import { useState, useRef } from "react"
import { Send, Shield, CheckCircle, Image, BarChart2, X, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { Translations } from "@/lib/i18n"
import type { Poll } from "@/lib/types"

type ReviewPhase = "idle" | "reviewing" | "approved" | "posting"

interface PostBoxProps {
  onPost: (content: string, imageUrl?: string, poll?: Poll) => void
  isLoading?: boolean
  reviewProgress?: number
  reviewPhase?: ReviewPhase
  t: Translations
}

export function PostBox({ onPost, isLoading, reviewProgress = 0, reviewPhase = "idle", t }: PostBoxProps) {
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", ""])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if ((content.trim() || imagePreview || (pollQuestion && pollOptions.filter(o => o.trim()).length >= 2)) && !isLoading) {
      let poll: Poll | undefined
      if (showPollCreator && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
        poll = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(o => o.trim()).map(text => ({
            text,
            votes: 0,
            percentage: 0
          })),
          totalVotes: 0
        }
      }
      onPost(content.trim(), imagePreview || undefined, poll)
      setContent("")
      setImagePreview(null)
      setShowPollCreator(false)
      setPollQuestion("")
      setPollOptions(["", ""])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
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

          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mt-2"
              >
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-cover rounded-xl border border-border"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Poll Creator */}
          <AnimatePresence>
            {showPollCreator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 border border-border rounded-xl bg-secondary/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{t.addPoll}</span>
                  <button
                    onClick={() => setShowPollCreator(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder={t.pollQuestion}
                  className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary mb-2"
                />
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder={`${t.pollOption} ${index + 1}`}
                        className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => removePollOption(index)}
                          className="p-2 text-muted-foreground hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 4 && (
                  <button
                    onClick={addPollOption}
                    className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addOption}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
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
            <div className="flex items-center gap-2">
              {/* Image Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || showPollCreator}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 disabled:opacity-50 transition-colors"
                title={t.addImage}
              >
                <Image className="w-5 h-5" />
              </button>
              
              {/* Poll Toggle */}
              <button
                onClick={() => setShowPollCreator(!showPollCreator)}
                disabled={isLoading || !!imagePreview}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                  showPollCreator ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                title={t.addPoll}
              >
                <BarChart2 className="w-5 h-5" />
              </button>

              <span className={`text-sm ml-2 ${content.length > 250 ? "text-red-400" : "text-muted-foreground"}`}>
                {content.length}/280
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !imagePreview && !showPollCreator) || isLoading}
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

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, MailOpen, Trash2 } from "lucide-react"
import type { DirectMessage, PersonalityType } from "@/lib/types"
import { PERSONALITY_CONFIG, getAvatarInitials } from "@/lib/types"
import type { Translations, Language } from "@/lib/i18n"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

interface DMPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: DirectMessage[]
  onMarkAllRead: () => void
  onDeleteMessage: (id: string) => void
  t: Translations
  lang: Language
}

export function DMPanel({ 
  isOpen, 
  onClose, 
  messages, 
  onMarkAllRead,
  onDeleteMessage,
  t, 
  lang 
}: DMPanelProps) {
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null)
  const dateLocale = lang === "zh" ? zhCN : enUS
  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <h2 className="font-semibold">{t.directMessages}</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.markAllRead}
                  </button>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MailOpen className="w-12 h-12 mb-4 opacity-50" />
                  <p>{t.noDMs}</p>
                  <p className="text-xs mt-2 text-center px-4">{t.dmHint}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {messages.map((message) => {
                    const config = PERSONALITY_CONFIG[message.personality]
                    const initials = getAvatarInitials(message.from)
                    const isNegative = message.personality === "hater" || message.personality === "moral-knight"
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${
                          !message.isRead ? "bg-secondary/30" : ""
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full shrink-0 bg-gradient-to-br ${config.avatarGradient} flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium text-sm ${isNegative ? "text-red-400" : ""}`}>
                                {message.from}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(message.timestamp, { locale: dateLocale, addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 truncate ${isNegative ? "text-red-300/80" : "text-muted-foreground"}`}>
                              {message.content}
                            </p>
                          </div>
                          {!message.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Message Detail Modal */}
            <AnimatePresence>
              {selectedMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-card flex flex-col"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        onDeleteMessage(selectedMessage.id)
                        setSelectedMessage(null)
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${PERSONALITY_CONFIG[selectedMessage.personality].avatarGradient} flex items-center justify-center`}>
                        <span className="text-white font-bold">
                          {getAvatarInitials(selectedMessage.from)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{selectedMessage.from}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(selectedMessage.timestamp, { locale: dateLocale, addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      selectedMessage.personality === "hater" ? "text-red-300" : ""
                    }`}>
                      {selectedMessage.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

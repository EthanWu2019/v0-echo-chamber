"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, MailOpen, Trash2, Send, ArrowLeft } from "lucide-react"
import type { DirectMessage, PersonalityType } from "@/lib/types"
import { PERSONALITY_CONFIG, getAvatarInitials, getAvatarUrl } from "@/lib/types"
import type { Translations, Language } from "@/lib/i18n"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

interface DMPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: DirectMessage[]
  onMarkAllRead: () => void
  onDeleteMessage: (id: string) => void
  onSendReply: (messageId: string, content: string) => Promise<void>
  t: Translations
  lang: Language
}

export function DMPanel({ 
  isOpen, 
  onClose, 
  messages, 
  onMarkAllRead,
  onDeleteMessage,
  onSendReply,
  t, 
  lang 
}: DMPanelProps) {
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dateLocale = lang === "zh" ? zhCN : enUS
  const unreadCount = messages.filter(m => !m.isRead).length

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedMessage?.replies?.length])

  // Update selected message when messages array changes
  useEffect(() => {
    if (selectedMessage) {
      const updated = messages.find(m => m.id === selectedMessage.id)
      if (updated) {
        setSelectedMessage(updated)
      }
    }
  }, [messages, selectedMessage?.id])

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || isSending) return
    
    setIsSending(true)
    const text = replyText.trim()
    setReplyText("")
    
    try {
      await onSendReply(selectedMessage.id, text)
    } finally {
      setIsSending(false)
    }
  }

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
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
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
                    const isNegative = message.personality === "hater" || message.personality === "moral-knight"
                    const hasUnreadReplies = message.replies && message.replies.length > 0 && !message.isRead
                    const avatarUrl = getAvatarUrl(message.from, message.personality)
                    
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
                          <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-secondary">
                            <img 
                              src={avatarUrl} 
                              alt={message.from}
                              className="w-full h-full object-cover"
                            />
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
                              {/* Show last message in thread */}
                              {message.replies && message.replies.length > 0 
                                ? (message.replies[message.replies.length - 1].isFromUser 
                                    ? (lang === "zh" ? "你: " : "You: ") + message.replies[message.replies.length - 1].content
                                    : message.replies[message.replies.length - 1].content)
                                : message.content
                              }
                            </p>
                            {message.replies && message.replies.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {message.replies.length + 1} {lang === "zh" ? "条消息" : "messages"}
                              </p>
                            )}
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
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="absolute inset-0 bg-card flex flex-col"
                >
                  {/* Detail Header */}
                  <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="text-sm">{lang === "zh" ? "返回" : "Back"}</span>
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

                  {/* Conversation */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary">
                        <img 
                          src={getAvatarUrl(selectedMessage.from, selectedMessage.personality)} 
                          alt={selectedMessage.from}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedMessage.from}</p>
                        <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${PERSONALITY_CONFIG[selectedMessage.personality].bgColor} ${PERSONALITY_CONFIG[selectedMessage.personality].color}`}>
                          {PERSONALITY_CONFIG[selectedMessage.personality].label}
                        </p>
                      </div>
                    </div>
                    
                    {/* Initial message from them */}
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-secondary">
                        <img 
                          src={getAvatarUrl(selectedMessage.from, selectedMessage.personality)} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`p-3 rounded-2xl rounded-tl-sm max-w-[75%] ${
                        selectedMessage.personality === "hater" || selectedMessage.personality === "moral-knight"
                          ? "bg-red-500/10 text-red-300" 
                          : "bg-secondary"
                      }`}>
                        <p className="text-sm leading-relaxed">{selectedMessage.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(selectedMessage.timestamp, { locale: dateLocale, addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Conversation thread */}
                    {selectedMessage.replies && selectedMessage.replies.map((reply, i) => (
                      <div key={i} className={`flex gap-2 ${reply.isFromUser ? "flex-row-reverse" : ""}`}>
                        {!reply.isFromUser && (
                          <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-secondary">
                            <img 
                              src={getAvatarUrl(selectedMessage.from, selectedMessage.personality)} 
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl max-w-[75%] ${
                          reply.isFromUser 
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : selectedMessage.personality === "hater" || selectedMessage.personality === "moral-knight"
                              ? "bg-red-500/10 text-red-300 rounded-tl-sm"
                              : "bg-secondary rounded-tl-sm"
                        }`}>
                          <p className="text-sm">{reply.content}</p>
                          <p className={`text-xs mt-1 ${reply.isFromUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(reply.timestamp), { locale: dateLocale, addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {isSending && (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-secondary">
                          <img 
                            src={getAvatarUrl(selectedMessage.from, selectedMessage.personality)} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 rounded-2xl rounded-tl-sm bg-secondary">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-border shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={lang === "zh" ? "输入消息..." : "Type a message..."}
                        className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendReply()
                          }
                        }}
                        disabled={isSending}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSending}
                        className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
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

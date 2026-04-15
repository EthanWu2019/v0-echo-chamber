"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle } from "lucide-react"
import type { Comment } from "@/lib/types"
import { PERSONALITY_CONFIG } from "@/lib/types"
import type { Language } from "@/lib/i18n"
import { getPersonalityLabel } from "@/lib/i18n"

interface ToastNotification {
  id: string
  comment: Comment
  dismissed: boolean
}

interface NotificationToastProps {
  notifications: Comment[]
  onDismiss: (id: string) => void
  lang: Language
}

function NotificationItem({ 
  notification, 
  index, 
  onDismiss,
  lang
}: { 
  notification: Comment
  index: number
  onDismiss: (id: string) => void
  lang: Language
}) {
  const config = PERSONALITY_CONFIG[notification.personality] || PERSONALITY_CONFIG.hater
  const isNegative = notification.sentimentImpact < 0

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id)
    }, 3000 + index * 300)
    
    return () => clearTimeout(timer)
  }, [notification.id, index, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        x: isNegative ? [0, -2, 2, -1, 1, 0] : 0, 
        scale: 1,
      }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      transition={{ 
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        x: isNegative 
          ? { duration: 0.3, ease: "easeInOut" }
          : { duration: 0.2 }
      }}
      className={`bg-card/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg max-w-[240px] ${
        isNegative ? "border-red-500/50" : "border-border"
      }`}
    >
      <div className="flex items-start gap-2">
        {isNegative && (
          <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium truncate ${isNegative ? "text-red-300" : "text-foreground"}`}>
              {notification.username}
            </span>
            <span className={`text-[10px] px-1 py-0.5 rounded ${config.bgColor} ${config.color}`}>
              {getPersonalityLabel(lang, notification.personality)}
            </span>
          </div>
          <p className={`text-xs mt-0.5 line-clamp-1 ${
            isNegative ? "text-red-200/80" : "text-muted-foreground"
          }`}>
            {notification.content}
          </p>
        </div>

        <button
          onClick={() => onDismiss(notification.id)}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}

export function NotificationToast({ notifications, onDismiss, lang }: NotificationToastProps) {
  // Track which notifications have been shown as toasts
  const [toastIds, setToastIds] = useState<Set<string>>(new Set())
  const [visibleToasts, setVisibleToasts] = useState<ToastNotification[]>([])

  // Add new notifications as toasts
  useEffect(() => {
    const newToasts = notifications.filter(n => !toastIds.has(n.id))
    if (newToasts.length > 0) {
      setToastIds(prev => {
        const next = new Set(prev)
        newToasts.forEach(n => next.add(n.id))
        return next
      })
      setVisibleToasts(prev => [
        ...newToasts.map(comment => ({ id: comment.id, comment, dismissed: false })),
        ...prev
      ].slice(0, 4))
    }
  }, [notifications, toastIds])

  const handleDismissToast = (id: string) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-1.5">
      <AnimatePresence>
        {visibleToasts.slice(0, 4).map((toast, index) => (
          <NotificationItem
            key={toast.id}
            notification={toast.comment}
            index={index}
            onDismiss={handleDismissToast}
            lang={lang}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

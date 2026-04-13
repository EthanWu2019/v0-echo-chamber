"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, MessageCircle, AlertTriangle } from "lucide-react"
import type { Comment } from "@/lib/types"
import { PERSONALITY_CONFIG } from "@/lib/types"

interface NotificationToastProps {
  notifications: Comment[]
  onDismiss: (id: string) => void
}

export function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.slice(0, 5).map((notification, index) => {
          const config = PERSONALITY_CONFIG[notification.personality]
          const isNegative = notification.sentimentImpact < 0

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                ...(isNegative && { x: [0, -3, 3, -2, 2, 0] })
              }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                damping: 20,
                delay: index * 0.1
              }}
              className={`bg-card border rounded-xl p-3 shadow-lg ${
                isNegative ? "border-red-500/50" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isNegative ? "bg-red-500/20" : "bg-secondary"
                }`}>
                  {isNegative ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isNegative ? "text-red-300" : "text-foreground"}`}>
                      {notification.username}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 line-clamp-2 ${
                    isNegative ? "text-red-200/80" : "text-muted-foreground"
                  }`}>
                    {notification.content}
                  </p>
                </div>

                <button
                  onClick={() => onDismiss(notification.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

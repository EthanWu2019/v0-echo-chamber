"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import type { Comment, PersonalityType } from "@/lib/types"
import { PERSONALITY_CONFIG } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: string, content: string) => void
  depth?: number
}

export function CommentItem({ comment, onReply, depth = 0 }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes)

  const config = PERSONALITY_CONFIG[comment.personality]
  const isNegative = comment.sentimentImpact < 0

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim())
      setReplyContent("")
      setShowReplyInput(false)
    }
  }

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isNegative ? -20 : 0, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-border" : ""} mb-1`}
    >
      {/* Typing indicator */}
      {comment.isTyping ? (
        <div className="flex items-center gap-2 py-3">
          <div className="w-8 h-8 rounded-full bg-secondary shrink-0" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-muted-foreground rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">正在输入...</span>
        </div>
      ) : (
        <motion.div
          className={`py-4 px-3 rounded-lg ${isNegative ? "relative bg-red-500/5" : "bg-secondary/30"}`}
          animate={isNegative ? { x: [0, -2, 2, -1, 1, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-3 relative">
            {/* Avatar */}
            <div 
              className={`w-8 h-8 rounded-full shrink-0 ${
                comment.personality === "spam-bot" 
                  ? "bg-gradient-to-br from-green-400 to-blue-500"
                  : comment.personality === "stan"
                  ? "bg-gradient-to-br from-pink-400 to-purple-500"
                  : "bg-gradient-to-br from-gray-600 to-gray-700"
              }`}
            />

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${isNegative ? "text-red-300" : "text-foreground"}`}>
                  {comment.username}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.timestamp, { locale: zhCN, addSuffix: true })}
                </span>
              </div>

              {/* Content */}
              <p className={`mt-1 text-sm leading-relaxed ${
                isNegative ? "text-red-200/90" : "text-foreground/90"
              }`}>
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-2">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  <span>{likeCount}</span>
                </button>
                {depth < 2 && (
                  <button 
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>回复</span>
                  </button>
                )}
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Reply Input */}
              {showReplyInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="写下你的回复..."
                    className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg disabled:opacity-50 transition-opacity"
                  >
                    发送
                  </button>
                </motion.div>
              )}

              {/* Nested Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-1">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

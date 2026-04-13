"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Repeat2, Share, ChevronDown, ChevronUp } from "lucide-react"
import type { Post } from "@/lib/types"
import { CommentItem } from "./comment-item"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface PostCardProps {
  post: Post
  onReplyToComment: (postId: string, commentId: string, content: string) => void
}

export function PostCard({ post, onReplyToComment }: PostCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [liked, setLiked] = useState(false)

  const handleReply = (commentId: string, content: string) => {
    onReplyToComment(post.id, commentId, content)
  }

  const negativeComments = post.comments.filter(c => c.sentimentImpact < 0 && !c.isTyping)
  const hasNegativeVibes = negativeComments.length >= 2

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-2xl overflow-hidden transition-colors ${
        hasNegativeVibes ? "border-red-500/30" : "border-border"
      }`}
    >
      {/* Post Header */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">我</span>
              <span className="text-muted-foreground text-sm">@myself</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(post.timestamp, { locale: zhCN, addSuffix: true })}
              </span>
            </div>
            <p className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments.filter(c => !c.isTyping).length}</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-green-400 transition-colors">
            <Repeat2 className="w-5 h-5" />
            <span className="text-sm">{post.reposts}</span>
          </button>
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 transition-colors ${
              liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm">{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {expanded && post.comments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-1">
              {/* Generating indicator */}
              {post.isGenerating && (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full"
                  />
                  <span>网友们正在输入...</span>
                </div>
              )}
              
              {post.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                />
              ))}
            </div>

            {/* Expand/Collapse Button */}
            {post.comments.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border-t border-border transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    收起评论
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    展开更多评论
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

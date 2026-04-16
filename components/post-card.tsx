"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, ChevronDown, ChevronUp, Eye, Send } from "lucide-react"
import type { Post } from "@/lib/types"
import { CommentItem } from "./comment-item"
import { AnimatedCounter } from "./animated-counter"
import type { Language, Translations } from "@/lib/i18n"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

interface PostCardProps {
  post: Post
  onReplyToComment: (postId: string, commentId: string, content: string) => void
  onDeleteComment?: (postId: string, commentId: string, personality: string, username: string) => void
  onCommentOnPost?: (postId: string, content: string) => void
  replyingCommentIds?: Set<string>
  lang: Language
  t: Translations
  isOtherUser?: boolean
  username?: string
}

export function PostCard({ 
  post, 
  onReplyToComment, 
  onDeleteComment,
  onCommentOnPost,
  replyingCommentIds = new Set(), 
  lang, 
  t,
  isOtherUser = false,
  username
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [liked, setLiked] = useState(false)
  const [localLikeBonus, setLocalLikeBonus] = useState(0)
  const [commentText, setCommentText] = useState("")

  const dateLocale = lang === "zh" ? zhCN : enUS

  const handleReply = (commentId: string, content: string) => {
    onReplyToComment(post.id, commentId, content)
  }

  const handleDelete = (commentId: string, personality: string, username: string) => {
    onDeleteComment?.(post.id, commentId, personality, username)
  }

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLocalLikeBonus(0)
    } else {
      setLiked(true)
      setLocalLikeBonus(1)
    }
  }

  const handleSubmitComment = () => {
    if (commentText.trim() && onCommentOnPost) {
      onCommentOnPost(post.id, commentText.trim())
      setCommentText("")
    }
  }

  const negativeComments = post.comments.filter(c => c.sentimentImpact < 0 && !c.isTyping)
  const hasNegativeVibes = negativeComments.length >= 2

  const isCommentReplying = (commentId: string): boolean => {
    return replyingCommentIds.has(commentId)
  }

  const displayUsername = username || t.me
  const displayHandle = isOtherUser 
    ? `@${displayUsername.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`
    : t.myself

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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {displayUsername.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{displayUsername}</span>
              <span className="text-muted-foreground text-sm">{displayHandle}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(post.timestamp, { locale: dateLocale, addSuffix: true })}
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
            className={`flex items-center gap-2 transition-colors ${
              expanded ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className={`w-5 h-5 ${expanded ? "fill-primary/20" : ""}`} />
            <AnimatedCounter value={post.comments.filter(c => !c.isTyping).length} className="text-sm" />
          </button>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
            }`}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </motion.div>
            <AnimatedCounter value={post.likes + localLikeBonus} className="text-sm" />
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-5 h-5" />
            <AnimatedCounter value={post.views} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            {/* Comment Input */}
            {onCommentOnPost && (
              <div className="p-4 flex gap-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">U</span>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t.addComment || "Add a comment..."}
                    className="flex-1 bg-secondary/50 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 space-y-2">
              {/* Generating indicator */}
              {post.isGenerating && (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full"
                  />
                  <span>{t.usersTyping}</span>
                </div>
              )}
              
              <AnimatePresence>
                {post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    isReplying={isCommentReplying(comment.id)}
                    lang={lang}
                    t={t}
                    isOwnComment={comment.username === t.me}
                  />
                ))}
              </AnimatePresence>
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
                    {t.collapseComments}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    {t.expandComments}
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

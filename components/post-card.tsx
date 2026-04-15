"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Repeat2, Share, ChevronDown, ChevronUp, Eye } from "lucide-react"
import type { Post } from "@/lib/types"
import { CommentItem } from "./comment-item"
import type { Language, Translations } from "@/lib/i18n"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

interface PostCardProps {
  post: Post
  onReplyToComment: (postId: string, commentId: string, content: string) => void
  onDeleteComment?: (postId: string, commentId: string, personality: string, username: string) => void
  replyingCommentIds?: Set<string>
  lang: Language
  t: Translations
}

export function PostCard({ 
  post, 
  onReplyToComment, 
  onDeleteComment,
  replyingCommentIds = new Set(), 
  lang, 
  t 
}: PostCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [repostCount, setRepostCount] = useState(post.reposts)
  const [viewCount, setViewCount] = useState(post.views)

  const dateLocale = lang === "zh" ? zhCN : enUS

  // Sync external data changes with animation
  useEffect(() => {
    setLikeCount(post.likes)
    setRepostCount(post.reposts)
    setViewCount(post.views)
  }, [post.likes, post.reposts, post.views])

  const handleReply = (commentId: string, content: string) => {
    onReplyToComment(post.id, commentId, content)
  }

  const handleDelete = (commentId: string, personality: string, username: string) => {
    onDeleteComment?.(post.id, commentId, personality, username)
  }

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount(prev => Math.max(0, prev - 1))
    } else {
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }

  const negativeComments = post.comments.filter(c => c.sentimentImpact < 0 && !c.isTyping)
  const hasNegativeVibes = negativeComments.length >= 2

  // Check if a comment is being replied to
  const isCommentReplying = (commentId: string): boolean => {
    return replyingCommentIds.has(commentId)
  }

  // Number animation component
  const AnimatedNumber = ({ value }: { value: number }) => (
    <motion.span
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {value}
    </motion.span>
  )

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
            <span className="text-white text-lg font-bold">U</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{t.me}</span>
              <span className="text-muted-foreground text-sm">{t.myself}</span>
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
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments.filter(c => !c.isTyping).length}</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-green-400 transition-colors">
            <Repeat2 className="w-5 h-5" />
            <span className="text-sm tabular-nums">
              <AnimatedNumber value={repostCount} />
            </span>
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
            <span className="text-sm tabular-nums">
              <AnimatedNumber value={likeCount} />
            </span>
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-5 h-5" />
            <span className="text-sm tabular-nums">
              <AnimatedNumber value={viewCount} />
            </span>
          </div>
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

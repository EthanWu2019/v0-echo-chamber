"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, ChevronDown, ChevronUp, Eye, Send, Repeat2, Image as ImageIcon } from "lucide-react"
import type { Post, Poll, BlockedUser } from "@/lib/types"
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
  onPinComment?: (postId: string, commentId: string) => void
  onReportComment?: (postId: string, commentId: string, username: string) => void
  onBlockUser?: (username: string, personality: string) => void
  onVotePoll?: (postId: string, optionIndex: number) => void
  onRepost?: (postId: string, comment?: string) => void
  replyingCommentIds?: Set<string>
  blockedUsers?: BlockedUser[]
  lang: Language
  t: Translations
  isOtherUser?: boolean
  username?: string
  autoExpand?: boolean
}

export function PostCard({ 
  post, 
  onReplyToComment, 
  onDeleteComment,
  onCommentOnPost,
  onPinComment,
  onReportComment,
  onBlockUser,
  onVotePoll,
  onRepost,
  replyingCommentIds = new Set(),
  blockedUsers = [],
  lang, 
  t,
  isOtherUser = false,
  username,
  autoExpand = false
}: PostCardProps) {
  const [expanded, setExpanded] = useState(autoExpand)
  const [liked, setLiked] = useState(false)
  const [localLikeBonus, setLocalLikeBonus] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [showRepostModal, setShowRepostModal] = useState(false)
  const [repostComment, setRepostComment] = useState("")
  const [hasReposted, setHasReposted] = useState(false)
  const [localRepostBonus, setLocalRepostBonus] = useState(0)

  const dateLocale = lang === "zh" ? zhCN : enUS
  const blockedUsernames = new Set(blockedUsers.map(u => u.username))

  const handleReply = (commentId: string, content: string) => {
    onReplyToComment(post.id, commentId, content)
  }

  const handleDelete = (commentId: string, personality: string, username: string) => {
    onDeleteComment?.(post.id, commentId, personality, username)
  }

  const handleReport = (commentId: string, username: string) => {
    onReportComment?.(post.id, commentId, username)
  }

  const handleBlock = (username: string, personality: string) => {
    onBlockUser?.(username, personality)
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

  const handlePinComment = (commentId: string) => {
    onPinComment?.(post.id, commentId)
  }

  const handleVote = (optionIndex: number) => {
    if (post.poll && post.poll.userVotedIndex === undefined) {
      onVotePoll?.(post.id, optionIndex)
    }
  }

  const handleRepost = () => {
    if (!hasReposted) {
      onRepost?.(post.id, repostComment)
      setHasReposted(true)
      setLocalRepostBonus(1)
      setShowRepostModal(false)
      setRepostComment("")
    }
  }

  const negativeComments = post.comments.filter(c => c.sentimentImpact < 0 && !c.isTyping)
  const hasNegativeVibes = negativeComments.length >= 2

  // Sort comments: pinned first, then user's own comments, then by time
  const sortedComments = [...post.comments].sort((a, b) => {
    if (a.id === post.pinnedCommentId) return -1
    if (b.id === post.pinnedCommentId) return 1
    const aIsOwn = a.username === t.me
    const bIsOwn = b.username === t.me
    if (aIsOwn && !bIsOwn) return -1
    if (!aIsOwn && bIsOwn) return 1
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

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
      {/* Repost Header */}
      {post.repostOf && (
        <div className="px-4 pt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Repeat2 className="w-4 h-4" />
          <span>{t.repostBy} @{post.repostOf.username}</span>
        </div>
      )}

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

            {/* Image */}
            {post.imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border">
                <img 
                  src={post.imageUrl} 
                  alt="Post image" 
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Poll */}
            {post.poll && (
              <div className="mt-3 space-y-2">
                <p className="font-medium text-sm">{post.poll.question}</p>
                {post.poll.options.map((option, index) => {
                  const hasVoted = post.poll!.userVotedIndex !== undefined
                  const isSelected = post.poll!.userVotedIndex === index
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleVote(index)}
                      disabled={hasVoted}
                      className={`w-full p-3 rounded-lg text-left text-sm transition-all relative overflow-hidden ${
                        hasVoted 
                          ? "bg-secondary cursor-default" 
                          : "bg-secondary/50 hover:bg-secondary cursor-pointer"
                      } ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      {hasVoted && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${option.percentage}%` }}
                          className={`absolute inset-y-0 left-0 ${isSelected ? "bg-primary/30" : "bg-secondary"}`}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span>{option.text}</span>
                        {hasVoted && (
                          <span className="text-muted-foreground">{option.percentage}%</span>
                        )}
                      </div>
                    </button>
                  )
                })}
                <p className="text-xs text-muted-foreground">
                  {post.poll.totalVotes} {t.votesCount}
                </p>
              </div>
            )}

            {/* Original post if repost */}
            {post.repostOf && (
              <div className="mt-3 p-3 rounded-lg border border-border bg-secondary/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {post.repostOf.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">@{post.repostOf.username}</span>
                </div>
                <p className="text-sm text-muted-foreground">{post.repostOf.content}</p>
              </div>
            )}
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
            onClick={() => setShowRepostModal(true)}
            className={`flex items-center gap-2 transition-colors ${
              hasReposted ? "text-green-400" : "text-muted-foreground hover:text-green-400"
            }`}
          >
            <Repeat2 className="w-5 h-5" />
            <AnimatedCounter value={post.reposts + localRepostBonus} className="text-sm" />
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

      {/* Repost Modal */}
      <AnimatePresence>
        {showRepostModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowRepostModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-card border border-border rounded-2xl p-4 z-50"
            >
              <h3 className="font-semibold mb-3">{t.quoteRepost}</h3>
              <textarea
                value={repostComment}
                onChange={(e) => setRepostComment(e.target.value)}
                placeholder={t.repostComment}
                className="w-full bg-secondary/50 rounded-lg p-3 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="p-3 mt-2 rounded-lg border border-border bg-secondary/30 text-sm text-muted-foreground">
                <p className="truncate">{post.content}</p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowRepostModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleRepost}
                  className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                >
                  {t.repost}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                {sortedComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onDelete={!isOtherUser ? handleDelete : undefined}
                    onPin={!isOtherUser ? handlePinComment : undefined}
                    onReport={handleReport}
                    onBlock={handleBlock}
                    isReplying={isCommentReplying(comment.id)}
                    lang={lang}
                    t={t}
                    isOwnComment={comment.username === t.me}
                    isOwnPost={!isOtherUser}
                    isPinned={comment.id === post.pinnedCommentId}
                    isBlocked={blockedUsernames.has(comment.username)}
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

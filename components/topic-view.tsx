"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Flame, Loader2 } from "lucide-react"
import type { Post } from "@/lib/types"
import type { Language, Translations } from "@/lib/i18n"
import { PostCard } from "./post-card"

interface TopicViewProps {
  topic: { tag: string; count: string; hot: boolean }
  posts: Post[]
  onBack: () => void
  onReplyToComment: (postId: string, commentId: string, content: string) => void
  onDeleteComment?: (postId: string, commentId: string, personality: string, username: string) => void
  onCommentOnPost?: (postId: string, content: string) => void
  replyingCommentIds?: Set<string>
  isLoading?: boolean
  lang: Language
  t: Translations
}

export function TopicView({ 
  topic, 
  posts, 
  onBack, 
  onReplyToComment,
  onDeleteComment,
  onCommentOnPost,
  replyingCommentIds = new Set(),
  isLoading,
  lang, 
  t 
}: TopicViewProps) {
  return (
    <div className="space-y-4">
      {/* Topic Header */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t.back || "Back"}</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <span className="text-white text-xl">#</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">#{topic.tag}</h2>
              {topic.hot && <Flame className="w-5 h-5 text-orange-500" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {topic.count} {t.discussions}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t.loadingTopicPosts || "Loading posts..."}</p>
        </div>
      )}

      {/* Posts */}
      {!isLoading && (
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard
                  post={post}
                  onReplyToComment={onReplyToComment}
                  onDeleteComment={onDeleteComment}
                  onCommentOnPost={onCommentOnPost}
                  replyingCommentIds={replyingCommentIds}
                  lang={lang}
                  t={t}
                  isOtherUser={true}
                  username={(post as Post & { username?: string }).username}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.noPostsYet}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

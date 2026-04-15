"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Flame, MessageCircle, Heart, Repeat2, Eye } from "lucide-react"
import type { Post } from "@/lib/types"
import type { Language, Translations } from "@/lib/i18n"
import { AnimatedCounter } from "./animated-counter"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

interface TopicViewProps {
  topic: { tag: string; count: string; hot: boolean }
  posts: Post[]
  onBack: () => void
  onPostClick: (postId: string) => void
  lang: Language
  t: Translations
}

export function TopicView({ topic, posts, onBack, onPostClick, lang, t }: TopicViewProps) {
  const dateLocale = lang === "zh" ? zhCN : enUS

  return (
    <div className="space-y-4">
      {/* Topic Header */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
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

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onPostClick(post.id)}
            className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
          >
            <div className="flex gap-3">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">
                  {post.content.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {lang === "en" ? `User${Math.floor(Math.random() * 9999)}` : `用户${Math.floor(Math.random() * 9999)}`}
                  </span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(post.timestamp, { locale: dateLocale, addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-foreground line-clamp-3">
                  {post.content}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <AnimatedCounter value={post.comments.length} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Repeat2 className="w-4 h-4" />
                    <AnimatedCounter value={post.reposts} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <AnimatedCounter value={post.likes} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <AnimatedCounter value={post.views} />
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}

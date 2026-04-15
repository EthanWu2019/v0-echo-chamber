"use client"

import { motion } from "framer-motion"
import { TrendingUp, Flame, ChevronRight, Loader2 } from "lucide-react"
import type { Translations, Language } from "@/lib/i18n"

export interface TrendingTopic {
  tag: string
  count: string
  hot: boolean
}

interface TrendingWidgetProps {
  t: Translations
  lang: Language
  topics: TrendingTopic[]
  onTopicClick: (topic: TrendingTopic) => void
  onLoadMore: () => void
  isLoadingMore: boolean
}

export function TrendingWidget({ 
  t, 
  topics, 
  onTopicClick, 
  onLoadMore,
  isLoadingMore 
}: TrendingWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold text-foreground">{t.trendingTopics}</h3>
      </div>

      <div className="space-y-2">
        {topics.map((topic, index) => (
          <motion.button
            key={`${topic.tag}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onTopicClick(topic)}
            className="w-full flex items-center gap-3 group text-left p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-muted-foreground w-5 shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  #{topic.tag}
                </span>
                {topic.hot && (
                  <Flame className="w-3 h-3 text-orange-500 shrink-0" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {topic.count} {t.discussions}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>

      <button 
        onClick={onLoadMore}
        disabled={isLoadingMore}
        className="w-full mt-4 text-sm text-primary hover:underline text-center flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoadingMore ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          t.seeMore
        )}
      </button>
    </div>
  )
}

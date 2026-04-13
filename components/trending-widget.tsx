"use client"

import { motion } from "framer-motion"
import { TrendingUp, Flame } from "lucide-react"

const TRENDING_TOPICS = [
  { tag: "今天也想辞职", count: "12.3万", hot: true },
  { tag: "凌晨emo了", count: "8.7万", hot: false },
  { tag: "下班后不想回复消息", count: "6.2万", hot: true },
  { tag: "社恐真的好累", count: "5.1万", hot: false },
  { tag: "又熬夜了救命", count: "4.8万", hot: false },
]

export function TrendingWidget() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold text-foreground">热门话题</h3>
      </div>

      <div className="space-y-3">
        {TRENDING_TOPICS.map((topic, index) => (
          <motion.button
            key={topic.tag}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full flex items-start gap-3 group text-left"
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
                {topic.count} 讨论
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-primary hover:underline text-center">
        查看更多
      </button>
    </div>
  )
}

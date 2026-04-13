"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, Minus, AlertCircle } from "lucide-react"
import type { Translations } from "@/lib/i18n"

interface SentimentWidgetProps {
  sentiment: number
  trend: "up" | "down" | "stable"
  t: Translations
}

export function SentimentWidget({ sentiment, trend, t }: SentimentWidgetProps) {
  const getColor = () => {
    if (sentiment >= 70) return { bar: "from-green-500 to-emerald-500", text: "text-green-400", bg: "bg-green-500/20" }
    if (sentiment >= 40) return { bar: "from-yellow-500 to-orange-500", text: "text-yellow-400", bg: "bg-yellow-500/20" }
    return { bar: "from-red-500 to-rose-600", text: "text-red-400", bg: "bg-red-500/20" }
  }

  const getStatusText = () => {
    if (sentiment >= 70) return t.goodSituation
    if (sentiment >= 40) return t.neutralOpinion
    return t.reputationCrash
  }

  const color = getColor()
  const isLow = sentiment < 30

  return (
    <div className={`bg-card border rounded-2xl p-4 transition-colors ${
      isLow ? "border-red-500/50" : "border-border"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          {t.publicSentiment}
          {isLow && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
            </motion.div>
          )}
        </h3>
        <div className={`flex items-center gap-1 ${color.text}`}>
          {trend === "up" && <TrendingUp className="w-4 h-4" />}
          {trend === "down" && <TrendingDown className="w-4 h-4" />}
          {trend === "stable" && <Minus className="w-4 h-4" />}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color.bar} rounded-full`}
          initial={{ width: "50%" }}
          animate={{ 
            width: `${sentiment}%`,
            ...(isLow && { x: [0, -2, 2, -1, 1, 0] })
          }}
          transition={{ 
            width: { duration: 0.8, ease: "easeOut" },
            x: { duration: 0.3, repeat: Infinity, repeatDelay: 2 }
          }}
        />
        {/* Glow effect for low sentiment */}
        {isLow && (
          <motion.div
            className="absolute inset-0 bg-red-500/30 rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Percentage */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-2xl font-bold ${color.text}`}>
          {sentiment}%
        </span>
        <span className="text-sm text-muted-foreground">
          {getStatusText()}
        </span>
      </div>

      {/* Warning message */}
      {isLow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <p className="text-xs text-red-400">
            {t.sentimentWarning}
          </p>
        </motion.div>
      )}
    </div>
  )
}

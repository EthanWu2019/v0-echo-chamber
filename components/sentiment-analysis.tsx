"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"
import type { Translations, Language } from "@/lib/i18n"

interface SentimentAnalysisProps {
  sentimentHistory: number[]
  hotWords: { word: string; count: number; sentiment: "positive" | "negative" | "neutral" }[]
  heatHistory: number[]
  t: Translations
  lang: Language
}

export function SentimentAnalysis({ 
  sentimentHistory, 
  hotWords, 
  heatHistory,
  t,
  lang 
}: SentimentAnalysisProps) {
  const currentSentiment = sentimentHistory[sentimentHistory.length - 1] || 50
  const previousSentiment = sentimentHistory[sentimentHistory.length - 2] || 50
  const trend = currentSentiment > previousSentiment ? "up" : currentSentiment < previousSentiment ? "down" : "stable"

  const maxHeat = Math.max(...heatHistory, 1)
  const maxWordCount = Math.max(...hotWords.map(w => w.count), 1)

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t.sentimentAnalysis}</h3>
      </div>

      {/* Sentiment Trend Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{t.sentimentTrend}</span>
          <div className="flex items-center gap-1">
            {trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
            {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
            {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
            <span className={`text-sm font-medium ${
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
            }`}>
              {currentSentiment}%
            </span>
          </div>
        </div>
        <div className="h-20 flex items-end gap-1">
          {sentimentHistory.slice(-12).map((value, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              className={`flex-1 rounded-t transition-colors ${
                value >= 70 ? "bg-green-500/60" : value >= 40 ? "bg-yellow-500/60" : "bg-red-500/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hot Words Cloud */}
      <div>
        <span className="text-sm text-muted-foreground block mb-2">{t.hotWords}</span>
        <div className="flex flex-wrap gap-2">
          {hotWords.slice(0, 10).map((item, i) => {
            const size = 0.7 + (item.count / maxWordCount) * 0.5
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ fontSize: `${size}rem` }}
                className={`px-2 py-1 rounded-full ${
                  item.sentiment === "positive" 
                    ? "bg-green-500/20 text-green-400" 
                    : item.sentiment === "negative"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {item.word}
              </motion.span>
            )
          })}
        </div>
      </div>

      {/* Heat Curve */}
      <div>
        <span className="text-sm text-muted-foreground block mb-2">{t.heatCurve}</span>
        <div className="h-16 flex items-end gap-0.5">
          {heatHistory.slice(-20).map((value, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxHeat) * 100}%` }}
              className="flex-1 bg-gradient-to-t from-orange-500/60 to-red-500/60 rounded-t"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

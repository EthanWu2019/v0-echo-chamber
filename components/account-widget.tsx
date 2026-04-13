"use client"

import { motion } from "framer-motion"
import { Users, ThumbsUp, Flame, TrendingUp, AlertTriangle, Shield } from "lucide-react"
import type { AccountStats } from "@/lib/types"
import type { Translations } from "@/lib/i18n"

interface AccountWidgetProps {
  stats: AccountStats
  t: Translations
}

export function AccountWidget({ stats, t }: AccountWidgetProps) {
  const getReputationColor = () => {
    if (stats.reputation >= 70) return "text-green-400"
    if (stats.reputation >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  const getControversyLabel = () => {
    if (stats.controversy >= 70) return { label: t.controversyHigh, color: "text-red-400", bg: "bg-red-500/20" }
    if (stats.controversy >= 40) return { label: t.controversyMid, color: "text-yellow-400", bg: "bg-yellow-500/20" }
    return { label: t.controversyLow, color: "text-green-400", bg: "bg-green-500/20" }
  }

  const controversy = getControversyLabel()

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Shield className="w-4 h-4" />
        {t.accountData}
      </h3>

      {/* Followers & Haters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Users className="w-3 h-3" />
            <span>{t.followers}</span>
          </div>
          <motion.span 
            className="text-lg font-bold text-foreground"
            key={stats.followers}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {stats.followers.toLocaleString()}
          </motion.span>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{t.haters}</span>
          </div>
          <motion.span 
            className="text-lg font-bold text-red-400"
            key={stats.haters}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {stats.haters.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Stats bars */}
      <div className="space-y-3">
        {/* Reputation */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {t.reputation}
            </span>
            <span className={getReputationColor()}>{stats.reputation}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                stats.reputation >= 70 ? "bg-green-500" :
                stats.reputation >= 40 ? "bg-yellow-500" : "bg-red-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.reputation}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Controversy */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {t.controversy}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${controversy.bg} ${controversy.color}`}>
              {controversy.label}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                stats.controversy >= 70 ? "bg-red-500" :
                stats.controversy >= 40 ? "bg-yellow-500" : "bg-green-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.controversy}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Influence */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t.influence}
            </span>
            <span className="text-blue-400">{stats.influence}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.influence}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t.totalLikes}</span>
          <span className="text-foreground">{stats.totalLikes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

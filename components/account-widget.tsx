"use client"

import { motion } from "framer-motion"
import { Users, ThumbsUp, TrendingUp, AlertTriangle, Shield, Activity } from "lucide-react"
import type { AccountStats } from "@/lib/types"
import type { Translations } from "@/lib/i18n"

interface AccountWidgetProps {
  stats: AccountStats
  t: Translations
}

export function AccountWidget({ stats, t }: AccountWidgetProps) {
  const getControversyLabel = () => {
    if (stats.controversy >= 70) return { label: t.controversyHigh, color: "text-destructive", bg: "bg-destructive/10" }
    if (stats.controversy >= 40) return { label: t.controversyMid, color: "text-primary", bg: "bg-primary/10" }
    return { label: t.controversyLow, color: "text-accent", bg: "bg-accent/10" }
  }
  
  const getReputationColor = () => {
    if (stats.reputation >= 70) return "bg-accent"
    if (stats.reputation >= 40) return "bg-primary"
    return "bg-destructive"
  }

  const controversy = getControversyLabel()

  return (
    <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Shield className="w-4 h-4" />
        {t.accountData}
      </h3>

      {/* Followers & Haters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-lg p-3">
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
        <div className="bg-background rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{t.haters}</span>
          </div>
          <motion.span 
            className="text-lg font-bold text-muted-foreground"
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
            <span className="text-foreground">{stats.reputation}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getReputationColor()}`}
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
              <Activity className="w-3 h-3" />
              {t.controversy}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${controversy.bg} ${controversy.color}`}>
              {controversy.label}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                stats.controversy >= 70 ? "bg-destructive" : stats.controversy >= 40 ? "bg-primary" : "bg-accent"
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
            <span className="text-accent">{stats.influence}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${stats.influence}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t.totalLikes}</span>
          <span className="text-foreground">{stats.totalLikes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

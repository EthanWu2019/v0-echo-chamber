"use client"

import { motion } from "framer-motion"
import { 
  Users, TrendingUp, TrendingDown, Minus, PieChart,
  BarChart3, Activity, Target, Zap
} from "lucide-react"
import type { AccountStats } from "@/lib/types"
import type { Translations } from "@/lib/i18n"

interface ProfileStatsProps {
  stats: AccountStats
  followerHistory: number[]
  t: Translations
}

export function ProfileStats({ stats, followerHistory, t }: ProfileStatsProps) {
  // Calculate hater percentage
  const haterPercentage = stats.followers > 0 
    ? Math.round((stats.haters / stats.followers) * 100) 
    : 0
  const fanPercentage = 100 - haterPercentage

  // Calculate trend
  const latestFollowers = followerHistory[followerHistory.length - 1] || 0
  const previousFollowers = followerHistory[followerHistory.length - 2] || 0
  const followerTrend = latestFollowers - previousFollowers

  // Max height for chart bars
  const maxFollowers = Math.max(...followerHistory, 1)

  return (
    <div className="space-y-6">
      {/* Follower Composition */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">
            {t.followers} Composition
          </h4>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Pie chart visualization */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-secondary"
              />
              {/* Fan segment */}
              <motion.circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${fanPercentage} ${100 - fanPercentage}`}
                className="text-green-500"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${fanPercentage} ${100 - fanPercentage}` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              {/* Hater segment */}
              <motion.circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${haterPercentage} ${100 - haterPercentage}`}
                strokeDashoffset={`-${fanPercentage}`}
                className="text-red-500"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${haterPercentage} ${100 - haterPercentage}` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">{stats.followers}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Real Fans</span>
              </div>
              <span className="text-sm font-medium text-foreground">{fanPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">{t.haters}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{haterPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Follower Trend */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">
              {t.followers} Trend
            </h4>
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            followerTrend > 0 ? "text-green-400" : followerTrend < 0 ? "text-red-400" : "text-muted-foreground"
          }`}>
            {followerTrend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : followerTrend < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{followerTrend > 0 ? "+" : ""}{followerTrend}</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1 h-20">
          {followerHistory.map((count, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(count / maxFollowers) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Earlier</span>
          <span>Now</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Activity className="w-3 h-3" />
            <span>Engagement Rate</span>
          </div>
          <span className="text-lg font-bold text-foreground">
            {stats.followers > 0 ? ((stats.totalLikes / Math.max(stats.totalPosts, 1) / stats.followers) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Target className="w-3 h-3" />
            <span>Avg Likes/Post</span>
          </div>
          <span className="text-lg font-bold text-foreground">
            {stats.totalPosts > 0 ? Math.round(stats.totalLikes / stats.totalPosts) : 0}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Zap className="w-3 h-3" />
            <span>{t.influence}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-400">{stats.influence}%</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.influence}%` }}
              />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Users className="w-3 h-3" />
            <span>Fan Loyalty</span>
          </div>
          <span className={`text-lg font-bold ${fanPercentage >= 70 ? "text-green-400" : fanPercentage >= 40 ? "text-yellow-400" : "text-red-400"}`}>
            {fanPercentage >= 70 ? "High" : fanPercentage >= 40 ? "Medium" : "Low"}
          </span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Home, Bell, User, Radio } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  notificationCount: number
}

const navItems = [
  { icon: Home, label: "首页", active: true },
  { icon: Bell, label: "通知", hasNotification: true },
  { icon: User, label: "个人主页" },
]

export function Sidebar({ notificationCount }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="relative">
          <Radio className="w-8 h-8 text-red-500" />
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          EchoChamber
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
              ${item.active 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              <AnimatePresence>
                {item.hasNotification && notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold text-white relative z-10">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-base font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Disclaimer */}
      <div className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          这是一个教育性模拟器，旨在展示网络暴力的危害。所有评论均由 AI 生成。
        </p>
      </div>
    </aside>
  )
}

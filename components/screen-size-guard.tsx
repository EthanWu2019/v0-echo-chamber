"use client"

import { Monitor } from "lucide-react"
import type { Language, Translations } from "@/lib/i18n"

interface ScreenSizeGuardProps {
  lang: Language
  t: Translations
  children: React.ReactNode
}

export function ScreenSizeGuard({ lang, t, children }: ScreenSizeGuardProps) {
  return (
    <>
      {/* Mobile/Tablet Block Screen */}
      <div className="lg:hidden fixed inset-0 z-[9999] bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
            <Monitor className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-3">
            {lang === "zh" ? "请使用电脑访问" : "Please Use Desktop"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            {lang === "zh" 
              ? "EchoChamber 是为桌面端设计的沉浸式体验。为了获得最佳效果，请使用 16:9 屏幕的电脑浏览器访问。"
              : "EchoChamber is designed as an immersive desktop experience. For the best experience, please visit on a computer with a 16:9 screen."
            }
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/60 bg-secondary/50 px-3 py-2 rounded-lg">
            <span>{lang === "zh" ? "推荐分辨率" : "Recommended"}: 1920x1080+</span>
          </div>
        </div>
      </div>
      
      {/* Desktop Content */}
      <div className="hidden lg:block">
        {children}
      </div>
    </>
  )
}

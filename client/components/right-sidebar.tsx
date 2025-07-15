import type React from "react"
import { PrayerTimesWidget } from "@/components/prayer-times-widget"
import { IslamicQuote } from "@/components/islamic-quote"

interface RightSidebarProps {
  children?: React.ReactNode
}

export function RightSidebar({ children }: RightSidebarProps) {
  return (
    <div className="hidden lg:block space-y-6 sticky top-0 h-screen overflow-y-auto">
      {children}
      <PrayerTimesWidget />
      <IslamicQuote />
    </div>
  )
}

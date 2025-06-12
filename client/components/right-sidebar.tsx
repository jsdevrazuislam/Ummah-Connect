import type React from "react"
import { PrayerTimesWidget } from "@/components/prayer-times-widget"
import { IslamicQuote } from "@/components/islamic-quote"
import { SuggestedUsers } from "@/components/suggested-users"
import { TrendingTopics } from "@/components/trending-topics"

interface RightSidebarProps {
  children?: React.ReactNode
}

export function RightSidebar({ children }: RightSidebarProps) {
  return (
    <div className="hidden lg:block space-y-6 sticky top-0 h-screen overflow-y-auto">
      {children}
      <PrayerTimesWidget />
      <IslamicQuote />
      <TrendingTopics />
      <SuggestedUsers />
    </div>
  )
}

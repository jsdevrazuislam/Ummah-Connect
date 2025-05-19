import { PrayerTimesWidget } from "@/components/prayer-times-widget"
import { IslamicQuote } from "@/components/islamic-quote"
import { SuggestedUsers } from "@/components/suggested-users"
import { TrendingTopics } from "@/components/trending-topics"

export function RightSidebar() {
  return (
    <div className="hidden lg:block w-[320px] p-4 space-y-6 sticky top-0 h-screen overflow-y-auto">
      <PrayerTimesWidget />
      <IslamicQuote />
      <TrendingTopics />
      <SuggestedUsers />
    </div>
  )
}

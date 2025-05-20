import { MainFeed } from "@/components/main-feed"
import { SideNav } from "@/components/side-nav"
import { RightSidebar } from "@/components/right-sidebar"
import { StorySection } from "@/components/story-section"
import { AIPrayerReminder } from "@/components/ai-prayer-reminder"
import { AIContentRecommendations } from "@/components/ai-content-recommendations"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 border-x border-border">
        <StorySection />
        <div className="p-4 md:hidden">
          <AIPrayerReminder />
        </div>
        <MainFeed />
      </main>
      <RightSidebar>
        <AIPrayerReminder />
        <AIContentRecommendations />
      </RightSidebar>
    </div>
  )
}

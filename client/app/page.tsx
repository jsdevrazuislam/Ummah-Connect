import { MainFeed } from "@/components/main-feed"
import { StorySection } from "@/components/story-section"
import { AIPrayerReminder } from "@/components/ai-prayer-reminder"
import { SocialMediaLayout } from "@/components/layouts/main-layout"

export default function Home() {
  return (
    <SocialMediaLayout>
      <StorySection />
      <div className="p-4 md:hidden">
        <AIPrayerReminder />
      </div>
      <MainFeed />
    </SocialMediaLayout>
  )
}

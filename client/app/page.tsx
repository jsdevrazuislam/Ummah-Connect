import { MainFeed } from "@/components/main-feed"
import { SideNav } from "@/components/side-nav"
import { RightSidebar } from "@/components/right-sidebar"
import { StorySection } from "@/components/story-section"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 border-x border-border">
        <StorySection />
        <MainFeed />
      </main>
      <RightSidebar />
    </div>
  )
}

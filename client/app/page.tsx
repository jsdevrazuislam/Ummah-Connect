import { MainFeed } from "@/components/main-feed"
import { StorySection } from "@/components/story-section"
import { AIPrayerReminder } from "@/components/ai-prayer-reminder"
import { AIContentRecommendations } from "@/components/ai-content-recommendations"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { SideNav } from "@/components/side-nav"
import { RightSidebar } from "@/components/right-sidebar"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="lg:hidden absolute top-2 left-4 z-50">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SideNav />
                </SheetContent>
              </Sheet>
            </div>
            <div className="lg:block hidden">
              <SideNav />
            </div>
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

import { SideNav } from "@/components/side-nav"
import { RightSidebar } from "@/components/right-sidebar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock trending topics
const trendingTopics = [
  { id: 1, tag: "Ramadan", posts: "2.3K posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 2, tag: "IslamicFinance", posts: "1.5K posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 3, tag: "Hajj2023", posts: "1.2K posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 4, tag: "FridayReminder", posts: "950 posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 5, tag: "IslamicArt", posts: "820 posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 6, tag: "Charity", posts: "780 posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 7, tag: "Dua", posts: "650 posts", image: "/placeholder.svg?height=200&width=200" },
  { id: 8, tag: "Quran", posts: "520 posts", image: "/placeholder.svg?height=200&width=200" },
]

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 border-x border-border">
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Explore</h1>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search Ummah Connect" className="pl-10" />
          </div>
          <Tabs defaultValue="for-you" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="for-you" className="flex-1">
                For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">
                Trending
              </TabsTrigger>
              <TabsTrigger value="news" className="flex-1">
                News
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.map((topic) => (
              <Card key={topic.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img src={topic.image || "/placeholder.svg"} alt={topic.tag} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold">#{topic.tag}</h3>
                    <p className="text-white/80 text-sm">{topic.posts}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <RightSidebar />
    </div>
  )
}

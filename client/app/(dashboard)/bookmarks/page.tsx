import { SideNav } from "@/components/side-nav"
import { RightSidebar } from "@/components/right-sidebar"
import { Post } from "@/components/post"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bookmark } from "lucide-react"

// Mock bookmarked posts
const bookmarkedPosts = [
  {
    id: "1",
    user: {
      name: "Ahmed Khan",
      username: "ahmed_k",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "The Prophet ﷺ said: 'The example of a believer is like a fresh tender plant; from whichever direction the wind blows, it bends the plant. But when the wind dies down, it straightens up again.' (Bukhari)",
    timestamp: "2 days ago",
    likes: 124,
    comments: 18,
    shares: 7,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    user: {
      name: "Fatima Ali",
      username: "fatima_a",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "5 books every Muslim should read:\n1. The Sealed Nectar\n2. Reclaim Your Heart\n3. The Productive Muslim\n4. Don't Be Sad\n5. In The Early Hours\n\nWhat would you add to this list?",
    timestamp: "1 week ago",
    likes: 89,
    comments: 42,
    shares: 15,
  },
  {
    id: "3",
    user: {
      name: "Omar Farooq",
      username: "omar_f",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Reminder: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.' (Quran 13:11)",
    timestamp: "2 weeks ago",
    likes: 215,
    comments: 31,
    shares: 54,
  },
]

export default function BookmarksPage() {
  return (
      <main className="flex-1 border-x border-border">
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Bookmarks</h1>
          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {bookmarkedPosts.length > 0 ? (
          <div>
            {bookmarkedPosts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No bookmarks yet</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              When you bookmark posts, they'll appear here for you to easily find later.
            </p>
          </div>
        )}
      </main>
  )
}

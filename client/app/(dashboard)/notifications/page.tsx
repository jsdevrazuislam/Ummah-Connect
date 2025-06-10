import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react"

// Mock notifications
const notifications = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Aisha Rahman",
      username: "aisha_r",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "liked your post",
    time: "2 minutes ago",
    postSnippet: "Alhamdulillah for another beautiful day!",
  },
  {
    id: 2,
    type: "follow",
    user: {
      name: "Ibrahim Khan",
      username: "ibrahim_k",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "followed you",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "comment",
    user: {
      name: "Yusuf Islam",
      username: "yusuf_i",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "commented on your post",
    comment: "JazakAllah Khair for sharing this beautiful reminder!",
    time: "3 hours ago",
    postSnippet: "The Prophet ﷺ said, 'The best among you are those who have the best manners and character.'",
  },
  {
    id: 4,
    type: "mention",
    user: {
      name: "Fatima Ali",
      username: "fatima_a",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "mentioned you in a post",
    time: "Yesterday",
    postSnippet: "Learning so much from @abdullah_m about Islamic history!",
  },
]

export default function NotificationsPage() {
  return (
      <>
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4 ml-12 lg:ml-0">Notifications</h1>
          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="mentions" className="flex-1">
                Mentions
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex-1">
                Verified
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div>
          {notifications.map((notification) => (
            <div key={notification.id} className="p-4 border-b border-border hover:bg-muted/50">
              <div className="flex gap-3">
                <div className="mt-1">
                  {notification.type === "like" && (
                    <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                      <Heart className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  {notification.type === "follow" && (
                    <div className="bg-primary/10 p-2 rounded-full">
                      <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  {notification.type === "comment" && (
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                  {notification.type === "mention" && (
                    <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
                      <Bell className="h-4 w-4 text-amber-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{notification.user.name}</span>
                    <span className="text-muted-foreground">{notification.content}</span>
                  </div>
                  {notification.postSnippet && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-1">"{notification.postSnippet}"</div>
                  )}
                  {notification.comment && (
                    <div className="mt-2 text-sm border-l-2 border-muted pl-3">{notification.comment}</div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">{notification.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
  )
}

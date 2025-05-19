import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Link2, MapPin } from "lucide-react"
import { Post } from "@/components/post"
import { SideNav } from "@/components/side-nav"

// Mock data for demonstration
const userProfile = {
  name: "Abdullah Muhammad",
  username: "abdullah_m",
  avatar: "/placeholder.svg?height=120&width=120",
  bio: "Software Engineer | Muslim | Sharing knowledge and inspiration | Interested in tech, Islamic history, and photography",
  location: "Kuala Lumpur, Malaysia",
  website: "abdullah.dev",
  joinedDate: "Joined March 2020",
  following: 245,
  followers: 1024,
  coverImage: "/placeholder.svg?height=200&width=600",
}

const userPosts = [
  {
    id: "1",
    user: {
      name: userProfile.name,
      username: userProfile.username,
      avatar: userProfile.avatar,
    },
    content:
      "Just finished an amazing Islamic architecture tour in Istanbul. The Blue Mosque and Hagia Sophia are truly breathtaking masterpieces! #Travel #IslamicArt",
    timestamp: "2 days ago",
    likes: 124,
    comments: 18,
    shares: 7,
  },
  {
    id: "2",
    user: {
      name: userProfile.name,
      username: userProfile.username,
      avatar: userProfile.avatar,
    },
    content:
      "Alhamdulillah for the blessing of technology that allows us to connect with Muslims around the world. Remember to use these tools for good and spreading beneficial knowledge!",
    timestamp: "1 week ago",
    likes: 89,
    comments: 12,
    shares: 5,
  },
]

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 border-x border-border">
        <div className="relative">
          <div className="h-48 bg-muted w-full">
            <img
              src={userProfile.coverImage || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start">
              <Avatar className="h-24 w-24 border-4 border-background -mt-12">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <Button variant="outline">Edit Profile</Button>
            </div>

            <div className="mt-4">
              <h1 className="text-xl font-bold">{userProfile.name}</h1>
              <p className="text-muted-foreground">@{userProfile.username}</p>

              <p className="mt-3">{userProfile.bio}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                {userProfile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}

                {userProfile.website && (
                  <div className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    <a href={`https://${userProfile.website}`} className="text-primary hover:underline">
                      {userProfile.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{userProfile.joinedDate}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-sm">
                <div>
                  <span className="font-semibold">{userProfile.following}</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div>
                  <span className="font-semibold">{userProfile.followers}</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="posts" className="mt-4">
            <TabsList className="w-full justify-start px-4 border-b rounded-none">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="replies" className="flex-1">
                Replies
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex-1">
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              {userPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </TabsContent>

            <TabsContent value="replies">
              <div className="p-8 text-center text-muted-foreground">No replies yet</div>
            </TabsContent>

            <TabsContent value="media">
              <div className="p-8 text-center text-muted-foreground">No media posts yet</div>
            </TabsContent>

            <TabsContent value="likes">
              <div className="p-8 text-center text-muted-foreground">No liked posts yet</div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

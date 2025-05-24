"use client"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Post } from "@/components/post"
import { CreatePostForm } from "@/components/create-post-form"
import { MoreHorizontal, Users, Settings, Bell, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock group data
const groupData = {
  id: "3",
  name: "Muslim Professionals",
  description:
    "A community for Muslim professionals to network, share career advice, job opportunities, and discuss workplace challenges from an Islamic perspective.",
  members: 2134,
  image: "/placeholder.svg?height=200&width=600",
  logo: "/placeholder.svg?height=100&width=100",
  isJoined: true,
  isAdmin: true,
  privacy: "Public",
  createdAt: "January 2022",
}

// Mock members data
const membersData = [
  {
    id: "1",
    name: "Abdullah Muhammad",
    username: "abdullah_m",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Admin",
  },
  {
    id: "2",
    name: "Aisha Rahman",
    username: "aisha_r",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Moderator",
  },
  {
    id: "3",
    name: "Omar Farooq",
    username: "omar_f",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Moderator",
  },
  {
    id: "4",
    name: "Fatima Ali",
    username: "fatima_a",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Member",
  },
  {
    id: "5",
    name: "Ibrahim Khan",
    username: "ibrahim_k",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Member",
  },
]

// Mock join requests
const joinRequests = [
  {
    id: "6",
    name: "Yusuf Islam",
    username: "yusuf_i",
    avatar: "/placeholder.svg?height=40&width=40",
    requestDate: "2 days ago",
  },
  {
    id: "7",
    name: "Khadija Ahmed",
    username: "khadija_a",
    avatar: "/placeholder.svg?height=40&width=40",
    requestDate: "3 days ago",
  },
]

// Mock posts
const groupPosts = [
  {
    id: "1",
    user: {
      name: "Abdullah Muhammad",
      username: "abdullah_m",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just shared a new article on LinkedIn about halal investing strategies for tech professionals. Check it out and let me know your thoughts! #HalalInvesting #FinancialLiteracy",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    shares: 2,
  },
  {
    id: "2",
    user: {
      name: "Aisha Rahman",
      username: "aisha_r",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Alhamdulillah, I just got promoted to Senior Software Engineer! Any tips from the group on how to excel in this new role while maintaining work-life balance?",
    timestamp: "5 hours ago",
    likes: 42,
    comments: 13,
    shares: 7,
    image: "/placeholder.svg?height=400&width=600",
  },
]

export default function GroupPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("discussion")
  const [posts, setPosts] = useState(groupPosts)

  const handleNewPost = (content: string) => {
    const newPost = {
      id: Date.now().toString(),
      user: {
        name: "You",
        username: "current_user",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
    }

    setPosts([newPost, ...posts])
  }

  return (
      <main className="flex-1 border-x border-border">
        {/* Group header */}
        <div className="relative">
          <div className="h-48 bg-muted w-full">
            <img src={groupData.image || "/placeholder.svg"} alt="Group cover" className="w-full h-full object-cover" />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <Avatar className="h-20 w-20 border-4 border-background -mt-10">
                  <AvatarImage src={groupData.logo || "/placeholder.svg"} alt={groupData.name} />
                  <AvatarFallback>{groupData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{groupData.name}</h1>
                    <Badge variant="outline" className="text-xs">
                      {groupData.privacy}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{groupData.members.toLocaleString()} members</span>
                    </div>
                    <span>•</span>
                    <span>Created {groupData.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {groupData.isJoined ? (
                  <>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Bell className="h-4 w-4" />
                      <span className="hidden sm:inline">Notifications</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Invite Members</DropdownMenuItem>
                        <DropdownMenuItem>Share Group</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Leave Group</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button size="sm">Join Group</Button>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm">{groupData.description}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full justify-start px-4 border-b rounded-none">
              <TabsTrigger value="discussion" className="flex-1">
                Discussion
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1">
                Members
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
              {groupData.isAdmin && (
                <TabsTrigger value="manage" className="flex-1">
                  Manage
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="discussion" className="mt-0">
              <div className="p-4 border-b border-border">
                <CreatePostForm onSubmit={handleNewPost} />
              </div>
              <div>
                {posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-0 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium">Members ({groupData.members})</h2>
                {groupData.isAdmin && (
                  <Link href={`/groups/${params.id}/members`}>
                    <Button variant="outline" size="sm">
                      Manage Members
                    </Button>
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {membersData.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">@{member.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === "Admin" && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {member.role === "Moderator" && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Mod
                        </Badge>
                      )}
                      {groupData.isAdmin && member.role !== "Admin" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== "Moderator" && <DropdownMenuItem>Make Moderator</DropdownMenuItem>}
                            {member.role === "Moderator" && <DropdownMenuItem>Remove as Moderator</DropdownMenuItem>}
                            <DropdownMenuItem className="text-destructive">Remove from Group</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-0 p-4">
              <h2 className="font-medium mb-4">Media Shared in Group</h2>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={`/placeholder.svg?height=200&width=200&text=Image+${i + 1}`}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {groupData.isAdmin && (
              <TabsContent value="manage" className="mt-0 p-4">
                <div className="space-y-6">
                  <div>
                    <h2 className="font-medium mb-4">Group Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href={`/groups/${params.id}/settings`}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Settings className="h-4 w-4" />
                          Group Settings
                        </Button>
                      </Link>
                      <Link href={`/groups/${params.id}/members`}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Users className="h-4 w-4" />
                          Manage Members
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-medium mb-4">Join Requests ({joinRequests.length})</h2>
                    {joinRequests.length > 0 ? (
                      <div className="space-y-4">
                        {joinRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.name} />
                                <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.name}</div>
                                <div className="text-xs text-muted-foreground">Requested {request.requestDate}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Decline
                              </Button>
                              <Button size="sm">Approve</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">No pending join requests</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
  )
}

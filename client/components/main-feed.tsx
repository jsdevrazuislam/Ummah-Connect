"use client"

import { useState } from "react"
import { Post } from "@/components/post"
import { CreatePostForm } from "@/components/create-post-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for demonstration
const mockPosts = [
  {
    id: "1",
    user: {
      name: "Ahmed Khan",
      username: "ahmed_k",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Alhamdulillah for another beautiful day! Just finished Fajr prayer and feeling blessed. How is everyone's morning going?",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    shares: 2,
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
      "Just finished reading Surah Al-Kahf as part of my Friday routine. Such powerful lessons in this surah! What's your favorite verse?",
    timestamp: "5 hours ago",
    likes: 42,
    comments: 13,
    shares: 7,
  },
  {
    id: "3",
    user: {
      name: "Omar Farooq",
      username: "omar_f",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Sharing this beautiful hadith: The Prophet ﷺ said, 'The best of you are those who are best to their families, and I am the best to my family.' (Tirmidhi)",
    timestamp: "1 day ago",
    likes: 87,
    comments: 21,
    shares: 34,
    image: "/placeholder.svg?height=400&width=600",
  },
]

export function MainFeed() {
  const [posts, setPosts] = useState(mockPosts)

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
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
        <h1 className="text-xl font-bold">Home</h1>
        <Tabs defaultValue="for-you" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="for-you" className="flex-1">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 border-b border-border">
        <CreatePostForm onSubmit={handleNewPost} />
      </div>

      <div>
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

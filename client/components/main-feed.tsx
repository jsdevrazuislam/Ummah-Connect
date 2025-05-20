"use client"

import { useState } from "react"
import { Post } from "@/components/post"
import { CreatePostForm } from "@/components/create-post-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIContentGenerator } from "@/components/ai-content-generator"
import { useToast } from "@/components/ui/use-toast"

// Mock current user
const currentUser = {
  name: "Abdullah Muhammad",
  username: "abdullah_m",
  avatar: "/placeholder.svg?height=40&width=40",
}

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
    location: {
      name: "Masjid an-Nabawi",
      city: "Medina, Saudi Arabia",
    },
    reactions: {
      like: 12,
      love: 8,
      care: 4,
    },
  }
]

export function MainFeed() {
  const [posts, setPosts] = useState(mockPosts)
  const [showContentGenerator, setShowContentGenerator] = useState(false)
  const { toast } = useToast()

  const handleNewPost = (content: string, image?: string, location?: { name: string; city: string }) => {
    const newPost = {
      id: Date.now().toString(),
      user: currentUser,
      content,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      image,
      location,
      reactions: {},
    }

    setPosts([newPost, ...posts])
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
    toast({
      title: "Post deleted",
      description: "Your post has been successfully deleted",
    })
  }

  const handleEditPost = (
    postId: string,
    content: string,
    image?: string,
    location?: { name: string; city: string },
  ) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, content, image, location } : post)))
    toast({
      title: "Post updated",
      description: "Your post has been successfully updated",
    })
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
        <CreatePostForm onSubmit={handleNewPost} onAIHelp={() => setShowContentGenerator(!showContentGenerator)} />

        {showContentGenerator && (
          <div className="mt-4">
            <AIContentGenerator />
          </div>
        )}
      </div>

      <div>
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
          />
        ))}
      </div>
    </div>
  )
}

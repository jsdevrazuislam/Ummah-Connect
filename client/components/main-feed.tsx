"use client"

import { useEffect, useState } from "react"
import { Post } from "@/components/post"
import { CreatePostForm } from "@/components/create-post-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIContentGenerator } from "@/components/ai-content-generator"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { get_all_posts } from "@/lib/apis/posts"
import { RefreshCw } from "lucide-react"
import { PostSkeleton } from "@/components/post-skeleton"

export function MainFeed() {
  const [page, setPage] = useState(0)
  const { isLoading, data, refetch } = useQuery<PostsResponse>({
    queryKey: ['get_all_posts'],
    queryFn: () => get_all_posts({ page: page + 1 })
  })
  const [posts, setPosts] = useState<PostsEntity[]>([])
  const [showContentGenerator, setShowContentGenerator] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setPosts(data.data.posts ?? [])
    }
  }, [data])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Home</h1>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading} className="h-9 w-9">
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
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
        <CreatePostForm onAIHelp={() => setShowContentGenerator(!showContentGenerator)} />

        {showContentGenerator && (
          <div className="mt-4">
            <AIContentGenerator />
          </div>
        )}
      </div>

      <div>
        {
          isLoading ? <>
            {
              Array(10).fill(10).map((item, index) => (
                <PostSkeleton key={index} />
              ))
            }
          </> : posts?.map((post) => (
            <Post
              key={post.id}
              post={post}
            />
          ))
        }
      </div>
    </div>
  )
}

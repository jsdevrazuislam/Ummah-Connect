"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash, Users, MessageCircle, TrendingUp, ArrowLeft, Share, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Post } from "@/components/post"
import { PostSkeleton } from "@/components/post-skeleton"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HashtagPageProps {
  params: {
    tag: string
  }
}

// Mock current user
const currentUser = {
  name: "Abdullah Muhammad",
  username: "abdullah_m",
  avatar: "/placeholder.svg?height=40&width=40",
}

// Mock hashtag data
const getHashtagData = (tag: string) => ({
  tag: decodeURIComponent(tag),
  posts: 15420,
  followers: 8900,
  growth: "+12%",
  description: `Discover posts about #${decodeURIComponent(tag)}`,
  category: "Religious",
  isFollowing: false,
})

// Mock posts for hashtag
const generateHashtagPosts = (tag: string, startId: number, count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: (startId + index).toString(),
    user: {
      name: `User ${startId + index}`,
      username: `user_${startId + index}`,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: `This is a post about #${decodeURIComponent(tag)}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. #${decodeURIComponent(tag)} #IslamicContent`,
    timestamp: `${Math.floor(Math.random() * 24)} hours ago`,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
    shares: Math.floor(Math.random() * 10),
    reactions: {
      like: Math.floor(Math.random() * 50),
      love: Math.floor(Math.random() * 30),
      wow: Math.floor(Math.random() * 10),
    },
    userReactions: [
      {
        user: { name: "Random User", username: "random_user", avatar: "/placeholder.svg?height=40&width=40" },
        reaction: "like" as const,
        timestamp: "1 hour ago",
      },
    ],
    image: Math.random() > 0.5 ? "/placeholder.svg?height=400&width=600" : undefined,
  }))
}

const relatedHashtags = [
  { tag: "IslamicQuotes", posts: 23100 },
  { tag: "MuslimYouth", posts: 18900 },
  { tag: "DuaOfTheDay", posts: 9800 },
  { tag: "IslamicArt", posts: 12300 },
  { tag: "Hajj2024", posts: 8750 },
]

export default function HashtagPage({ params }: HashtagPageProps) {
  const [hashtagData, setHashtagData] = useState(getHashtagData(params.tag))
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState("recent")
  const { toast } = useToast()

  useEffect(() => {
    // Load initial posts
    setIsLoading(true)
    setTimeout(() => {
      const initialPosts = generateHashtagPosts(params.tag, 1, 10)
      setPosts(initialPosts)
      setIsLoading(false)
    }, 1000)
  }, [params.tag])

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newPosts = generateHashtagPosts(params.tag, posts.length + 1, 5)
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setPage((prevPage) => prevPage + 1)

      if (page >= 5) {
        setHasMore(false)
      }
    } catch (error) {
      toast({
        title: "Error loading posts",
        description: "Failed to load more posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, posts.length, page, params.tag, toast])

  const handleFollowHashtag = () => {
    setHashtagData((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
    }))

    toast({
      title: hashtagData.isFollowing ? "Unfollowed hashtag" : "Following hashtag",
      description: hashtagData.isFollowing
        ? `You unfollowed #${hashtagData.tag}`
        : `You're now following #${hashtagData.tag}`,
    })
  }

  const handleShareHashtag = () => {
    const hashtagUrl = `https://ummahconnect.com/hashtag/${params.tag}`
    navigator.clipboard
      .writeText(hashtagUrl)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Hashtag link copied to clipboard",
        })
      })
      .catch(() => {
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        })
      })
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
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              content,
              image,
              location,
            }
          : post,
      ),
    )
    toast({
      title: "Post updated",
      description: "Your post has been successfully updated",
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/hashtags">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Hash className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">{hashtagData.tag}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant={hashtagData.isFollowing ? "default" : "outline"} onClick={handleFollowHashtag}>
                {hashtagData.isFollowing ? "Following" : "Follow"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShareHashtag}>
                    <Share className="h-4 w-4 mr-2" />
                    Share hashtag
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-muted-foreground">{hashtagData.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{hashtagData.posts.toLocaleString()}</span>
              <span className="text-muted-foreground">posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{hashtagData.followers.toLocaleString()}</span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{hashtagData.growth}</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="recent" className="flex-1">
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex-1">
                Popular
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <InfiniteScroll hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMorePosts}>
            <div>
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : (
                posts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                  />
                ))
              )}

              {isLoadingMore && (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You've reached the end of #{hashtagData.tag} posts</p>
                </div>
              )}
            </div>
          </InfiniteScroll>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80 p-4 space-y-4">
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Related Hashtags</h3>
            <div className="space-y-2">
              {relatedHashtags.map((hashtag) => (
                <Link
                  key={hashtag.tag}
                  href={`/hashtag/${hashtag.tag}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="font-medium">{hashtag.tag}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{hashtag.posts.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Hash, Users, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for hashtags
const trendingHashtags = [
  {
    tag: "Ramadan2024",
    posts: 15420,
    followers: 8900,
    growth: "+12%",
    description: "Share your Ramadan experiences and reflections",
    category: "Religious",
  },
  {
    tag: "IslamicQuotes",
    posts: 23100,
    followers: 12500,
    growth: "+8%",
    description: "Beautiful quotes from Quran and Hadith",
    category: "Inspiration",
  },
  {
    tag: "Hajj2024",
    posts: 8750,
    followers: 6200,
    growth: "+25%",
    description: "Hajj pilgrimage experiences and preparations",
    category: "Religious",
  },
  {
    tag: "MuslimYouth",
    posts: 18900,
    followers: 9800,
    growth: "+15%",
    description: "Connecting young Muslims worldwide",
    category: "Community",
  },
  {
    tag: "IslamicArt",
    posts: 12300,
    followers: 7100,
    growth: "+6%",
    description: "Beautiful Islamic art and calligraphy",
    category: "Art",
  },
  {
    tag: "DuaOfTheDay",
    posts: 9800,
    followers: 5400,
    growth: "+10%",
    description: "Daily duas and supplications",
    category: "Spiritual",
  },
]

const categories = [
  { name: "All", count: 150 },
  { name: "Religious", count: 45 },
  { name: "Community", count: 32 },
  { name: "Inspiration", count: 28 },
  { name: "Art", count: 18 },
  { name: "Spiritual", count: 27 },
]

const recentHashtags = [
  { tag: "FridayBlessings", posts: 1200, isNew: true },
  { tag: "IslamicHistory", posts: 3400, isNew: false },
  { tag: "MuslimWomen", posts: 5600, isNew: false },
  { tag: "IslamicEducation", posts: 2800, isNew: true },
  { tag: "Charity", posts: 4100, isNew: false },
  { tag: "PrayerTime", posts: 6700, isNew: false },
]

export default function HashtagsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [followedHashtags, setFollowedHashtags] = useState<string[]>(["Ramadan2024", "IslamicQuotes"])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredHashtags = trendingHashtags.filter((hashtag) => {
    const matchesSearch = hashtag.tag.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || hashtag.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFollowHashtag = (tag: string) => {
    setFollowedHashtags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Hashtags</h1>
          <p className="text-muted-foreground">
            Explore trending topics and join conversations in the Muslim community
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="gap-1"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Trending Hashtags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHashtags.map((hashtag) => (
              <Card key={hashtag.tag} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-primary" />
                      <Link
                        href={`/hashtag/${hashtag.tag}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {hashtag.tag}
                      </Link>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {hashtag.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{hashtag.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{hashtag.posts.toLocaleString()} posts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{hashtag.followers.toLocaleString()} followers</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{hashtag.growth}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={followedHashtags.includes(hashtag.tag) ? "default" : "outline"}
                      onClick={() => handleFollowHashtag(hashtag.tag)}
                    >
                      {followedHashtags.includes(hashtag.tag) ? "Following" : "Follow"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentHashtags.map((hashtag) => (
              <Card key={hashtag.tag} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-primary" />
                      <Link
                        href={`/hashtag/${hashtag.tag}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {hashtag.tag}
                      </Link>
                      {hashtag.isNew && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{hashtag.posts.toLocaleString()} posts</span>
                      <Button
                        size="sm"
                        variant={followedHashtags.includes(hashtag.tag) ? "default" : "outline"}
                        onClick={() => handleFollowHashtag(hashtag.tag)}
                      >
                        {followedHashtags.includes(hashtag.tag) ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          {followedHashtags.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No hashtags followed yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start following hashtags to see them here and get personalized content
                </p>
                <Button onClick={() => setSelectedCategory("All")}>Discover Hashtags</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingHashtags
                .filter((hashtag) => followedHashtags.includes(hashtag.tag))
                .map((hashtag) => (
                  <Card key={hashtag.tag} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-5 w-5 text-primary" />
                          <Link
                            href={`/hashtag/${hashtag.tag}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {hashtag.tag}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{hashtag.posts.toLocaleString()} posts</span>
                          <Button size="sm" variant="default" onClick={() => handleFollowHashtag(hashtag.tag)}>
                            Following
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

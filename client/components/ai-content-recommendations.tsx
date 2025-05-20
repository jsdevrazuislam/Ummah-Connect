"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, RefreshCw } from "lucide-react"
import Link from "next/link"

// Mock recommended content
const initialRecommendations = [
  {
    id: "1",
    type: "post",
    title: "Understanding Zakat: A Comprehensive Guide",
    user: {
      name: "Islamic Finance Network",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Islamic Finance",
    relevance: "Based on your interest in financial topics",
  },
  {
    id: "2",
    type: "group",
    title: "Quranic Arabic Study Circle",
    members: 3245,
    category: "Education",
    relevance: "Recommended because you follow similar groups",
  },
  {
    id: "3",
    type: "live",
    title: "Live Q&A: Raising Muslim Children in the West",
    user: {
      name: "Parenting in Islam",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    viewers: 156,
    category: "Family",
    relevance: "Trending in your network",
  },
]

export function AIContentRecommendations() {
  const [recommendations, setRecommendations] = useState(initialRecommendations)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshRecommendations = () => {
    setIsRefreshing(true)

    // Simulate API call to get new recommendations
    setTimeout(() => {
      const newRecommendations = [
        {
          id: "4",
          type: "post",
          title: "The Importance of Dhikr in Daily Life",
          user: {
            name: "Spiritual Growth",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          category: "Spirituality",
          relevance: "Matches your recent activity",
        },
        {
          id: "5",
          type: "group",
          title: "Halal Travel Enthusiasts",
          members: 2156,
          category: "Travel",
          relevance: "You might be interested based on your profile",
        },
        {
          id: "6",
          type: "live",
          title: "Islamic Calligraphy Workshop",
          user: {
            name: "Islamic Arts Foundation",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          viewers: 89,
          category: "Art",
          relevance: "Based on your interest in Islamic culture",
        },
      ]

      setRecommendations(newRecommendations)
      setIsRefreshing(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Recommendations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRecommendations}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((item) => (
          <div key={item.id} className="border border-border rounded-md p-3 hover:bg-muted/50 transition-colors">
            {item.type === "post" && (
              <Link href="#" className="block">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.user.avatar || "/placeholder.svg"} alt={item.user.name} />
                    <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                      <span className="text-xs text-muted-foreground">{item.user.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.relevance}</p>
                  </div>
                </div>
              </Link>
            )}

            {item.type === "group" && (
              <Link href="#" className="block">
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                    <span className="text-xs font-medium">{item.title.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                      <span className="text-xs text-muted-foreground">{item.members} members</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.relevance}</p>
                  </div>
                </div>
              </Link>
            )}

            {item.type === "live" && (
              <Link href="#" className="block">
                <div className="flex gap-3">
                  <div className="relative h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.user.avatar || "/placeholder.svg"} alt={item.user.name} />
                      <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 bg-red-500 h-2 w-2 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                      <span className="text-xs text-muted-foreground">{item.viewers} watching</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.relevance}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Video, Users } from "lucide-react"
import Link from "next/link"

// Mock live streams data
const liveStreams = [
  {
    id: "1",
    title: "Live Q&A: Islamic Finance Basics",
    user: {
      name: "Ahmed Khan",
      username: "ahmed_k",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    thumbnail: "/placeholder.svg?height=200&width=350&text=Live:+Islamic+Finance",
    viewers: 245,
    category: "Education",
  },
  {
    id: "2",
    title: "Quran Recitation & Tafsir",
    user: {
      name: "Fatima Ali",
      username: "fatima_a",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    thumbnail: "/placeholder.svg?height=200&width=350&text=Live:+Quran+Recitation",
    viewers: 512,
    category: "Quran",
  },
  {
    id: "3",
    title: "Islamic Art Workshop: Geometric Patterns",
    user: {
      name: "Omar Farooq",
      username: "omar_f",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    thumbnail: "/placeholder.svg?height=200&width=350&text=Live:+Art+Workshop",
    viewers: 178,
    category: "Art",
  },
  {
    id: "4",
    title: "Discussing Current Events from Islamic Perspective",
    user: {
      name: "Aisha Rahman",
      username: "aisha_r",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    thumbnail: "/placeholder.svg?height=200&width=350&text=Live:+Current+Events",
    viewers: 324,
    category: "Discussion",
  },
]

export default function LivePage() {
  const [activeTab, setActiveTab] = useState("browse")

  return (
      <>
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold ml-12 lg:ml-0">Live</h1>
            <Link href="/live/create">
              <Button size="sm" className="gap-1">
                <Video className="h-4 w-4" />
                <span>Go Live</span>
              </Button>
            </Link>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search live streams" className="pl-10" />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="browse" className="flex-1">
                Browse
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1">
                Following
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex-1">
                Categories
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreams.map((stream) => (
              <Link href={`/live/${stream.id}`} key={stream.id}>
                <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={stream.thumbnail || "/placeholder.svg"}
                        alt={stream.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {stream.viewers}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={stream.user.avatar || "/placeholder.svg"} alt={stream.user.name} />
                          <AvatarFallback>{stream.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium line-clamp-1">{stream.title}</h3>
                          <p className="text-sm text-muted-foreground">{stream.user.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{stream.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </>
  )
}

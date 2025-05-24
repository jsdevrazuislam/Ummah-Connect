"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SideNav } from "@/components/side-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VolumeX, Volume2, Users, Share, Heart, MoreHorizontal, Send } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock live stream data
const liveStreamData = {
  id: "1",
  title: "Live Q&A: Islamic Finance Basics",
  description:
    "Join me as I discuss the fundamentals of Islamic finance, halal investments, and answer your questions!",
  user: {
    name: "Ahmed Khan",
    username: "ahmed_k",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: 12500,
  },
  thumbnail: "/placeholder.svg?height=720&width=1280&text=Live:+Islamic+Finance",
  viewers: 245,
  likes: 189,
  category: "Education",
  tags: ["Islamic Finance", "Halal Investing", "Q&A"],
  startedAt: "2023-05-19T14:30:00Z",
}

// Mock chat messages
const initialChatMessages = [
  {
    id: "1",
    user: {
      name: "Ibrahim Khan",
      username: "ibrahim_k",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    message: "Assalamu alaikum! Excited for this session!",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    user: {
      name: "Aisha Rahman",
      username: "aisha_r",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    message: "Can you explain the difference between conventional and Islamic banking?",
    timestamp: "1 minute ago",
  },
  {
    id: "3",
    user: {
      name: "Omar Farooq",
      username: "omar_f",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    message: "JazakAllah khair for doing this stream! Very informative.",
    timestamp: "Just now",
  },
]

export default function LiveStreamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState(initialChatMessages)
  const [viewers, setViewers] = useState(liveStreamData.viewers)
  const [likes, setLikes] = useState(liveStreamData.likes)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate increasing viewers
    const viewerInterval = setInterval(() => {
      setViewers((prev) => prev + Math.floor(Math.random() * 3))
    }, 10000)

    // Simulate new chat messages
    const chatInterval = setInterval(() => {
      const randomMessages = [
        "MashaAllah, great explanation!",
        "Can you recommend some halal investment platforms?",
        "What's your opinion on cryptocurrency from an Islamic perspective?",
        "Jazak Allah khair for the knowledge!",
        "Is gold a good investment according to Islamic principles?",
      ]

      const randomUsers = [
        { name: "Yusuf Islam", username: "yusuf_i", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Khadija Ahmed", username: "khadija_a", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Bilal Hassan", username: "bilal_h", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Fatima Ali", username: "fatima_a", avatar: "/placeholder.svg?height=32&width=32" },
      ]

      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)]
      const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]

      const newMessage = {
        id: Date.now().toString(),
        user: randomUser,
        message: randomMessage,
        timestamp: "Just now",
      }

      setChatMessages((prev) => [...prev, newMessage])
    }, 15000)

    return () => {
      clearInterval(viewerInterval)
      clearInterval(chatInterval)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const toggleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: {
          name: "You",
          username: "current_user",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        message: chatMessage,
        timestamp: "Just now",
      }
      setChatMessages([...chatMessages, newMessage])
      setChatMessage("")
    }
  }

  return (
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Video section */}
        <div className="flex-1 md:max-w-[70%]">
          <div className="relative bg-black">
            {/* In a real app, this would be a video player */}
            <img
              src={liveStreamData.thumbnail || "/placeholder.svg"}
              alt={liveStreamData.title}
              className="w-full aspect-video object-contain"
            />
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={toggleMute}
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full bg-black/50 text-white hover:bg-black/70 px-3"
                >
                  <Users className="h-4 w-4 mr-1" />
                  {viewers}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h1 className="text-xl font-bold">{liveStreamData.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={liveStreamData.user.avatar || "/placeholder.svg"} alt={liveStreamData.user.name} />
                  <AvatarFallback>{liveStreamData.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{liveStreamData.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {liveStreamData.user.followers.toLocaleString()} followers
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="ml-2">
                  Follow
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className={liked ? "text-red-500" : ""} onClick={toggleLike}>
                  <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{liveStreamData.category}</Badge>
                {liveStreamData.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm">{liveStreamData.description}</p>
            </div>
          </div>
        </div>

        {/* Chat section */}
        <div className="md:w-[30%] border-t md:border-t-0 md:border-l border-border flex flex-col h-[500px] md:h-auto">
          <div className="p-3 border-b border-border">
            <h2 className="font-medium">Live Chat</h2>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.name} />
                    <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{message.user.name}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Send a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!chatMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>
  )
}

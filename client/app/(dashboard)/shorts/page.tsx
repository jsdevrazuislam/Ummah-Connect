"use client"

import { useState, useRef, useEffect } from "react"
import { SideNav } from "@/components/side-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, VolumeX, Volume2, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Mock shorts data
const mockShorts = [
  {
    id: "1",
    user: {
      name: "Ahmed Khan",
      username: "ahmed_k",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    description: "The beauty of Islamic architecture. SubhanAllah! #islamicart #architecture",
    videoUrl: "/placeholder.svg?height=1080&width=608",
    likes: 1245,
    comments: 89,
    shares: 56,
  },
  {
    id: "2",
    user: {
      name: "Fatima Ali",
      username: "fatima_a",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    description: "Quick tip on how to improve your Quran recitation #quran #tajweed",
    videoUrl: "/placeholder.svg?height=1080&width=608",
    likes: 876,
    comments: 45,
    shares: 32,
  },
  {
    id: "3",
    user: {
      name: "Omar Farooq",
      username: "omar_f",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    description: "Beautiful nasheed that reminds us of Allah's mercy #nasheed #islam",
    videoUrl: "/placeholder.svg?height=1080&width=608",
    likes: 2341,
    comments: 156,
    shares: 98,
  },
]

interface ShortVideoProps {
  short: (typeof mockShorts)[0]
  isActive: boolean
}

function ShortVideo({ short, isActive }: ShortVideoProps) {
  const [liked, setLiked] = useState(false)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isActive) {
      if (playing) {
        videoRef.current?.play().catch(() => {
          // Autoplay was prevented, do nothing
        })
      } else {
        videoRef.current?.pause()
      }
    } else {
      videoRef.current?.pause()
      setPlaying(false)
    }
  }, [isActive, playing])

  const togglePlay = () => {
    setPlaying(!playing)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const toggleLike = () => {
    setLiked(!liked)
  }

  // For demo purposes, we're using an image instead of a video
  // In a real app, you would use a video element
  return (
    <div className="relative h-full w-full snap-start">
      <div className="absolute inset-0 bg-black">
        {/* In a real app, this would be a video element */}
        <img
          src={short.videoUrl || "/placeholder.svg"}
          alt="Short video"
          className="h-full w-full object-cover"
          onClick={togglePlay}
        />
        {/* This would be the actual video in a real app */}
        {/* <video
          ref={videoRef}
          src={short.videoUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          onClick={togglePlay}
          muted={muted}
        /> */}
      </div>

      {/* Play/Pause overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
          <div className="bg-black/30 rounded-full p-4">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      )}

      {/* Video controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
        <div className="space-y-4 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={short.user.avatar || "/placeholder.svg"} alt={short.user.name} />
                <AvatarFallback>{short.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">@{short.user.username}</span>
              <Button size="sm" variant="secondary" className="ml-2 h-8">
                Follow
              </Button>
            </div>
            <p className="text-white mt-2 text-sm">{short.description}</p>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex flex-col gap-4 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={toggleLike}
          >
            <Heart className={cn("h-6 w-6", liked ? "fill-red-500 text-red-500" : "")} />
          </Button>
          <span className="text-white text-xs">{liked ? short.likes + 1 : short.likes}</span>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <span className="text-white text-xs">{short.comments}</span>

          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white hover:bg-black/40">
            <Share className="h-6 w-6" />
          </Button>
          <span className="text-white text-xs">{short.shares}</span>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={toggleMute}
          >
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h3 className="text-white font-medium">Comments ({short.comments})</h3>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowComments(false)}>
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Sample comments */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">user123</span>
                  <span className="text-white/50 text-xs">2h ago</span>
                </div>
                <p className="text-white text-sm mt-1">MashaAllah, beautiful architecture!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">islamic_art_lover</span>
                  <span className="text-white/50 text-xs">5h ago</span>
                </div>
                <p className="text-white text-sm mt-1">SubhanAllah, where is this located?</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Your avatar" />
                <AvatarFallback>YA</AvatarFallback>
              </Avatar>
              <Input
                placeholder="Add a comment..."
                className="bg-white/10 border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="sm">Post</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ShortsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const itemHeight = container.clientHeight
      const index = Math.round(scrollTop / itemHeight)
      setActiveIndex(index)
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
      <main className="flex-1 relative">
        <div ref={containerRef} className="h-[calc(100vh-0px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {mockShorts.map((short, index) => (
            <div key={short.id} className="h-full w-full snap-start">
              <ShortVideo short={short} isActive={index === activeIndex} />
            </div>
          ))}
        </div>
      </main>
  )
}

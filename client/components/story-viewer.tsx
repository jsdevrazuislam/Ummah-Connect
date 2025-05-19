"use client"

import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, ChevronLeft, ChevronRight, Heart, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface StoryItem {
  id: string
  type: "image" | "text"
  src?: string
  caption?: string
  timestamp: string
}

interface User {
  id: string
  name: string
  username: string
  avatar: string
}

interface Story {
  id: string
  user: User
  items: StoryItem[]
  viewed: boolean
}

interface StoryViewerProps {
  story: Story
  onClose: () => void
}

export function StoryViewer({ story, onClose }: StoryViewerProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const storyDuration = 5000 // 5 seconds per story

  const goToNextItem = useCallback(() => {
    if (currentItemIndex < story.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentItemIndex, story.items.length, onClose])

  const goToPrevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
      setProgress(0)
    }
  }

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / storyDuration) * 100
        if (newProgress >= 100) {
          clearInterval(interval)
          goToNextItem()
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentItemIndex, isPaused, goToNextItem])

  const handleTouchStart = () => {
    setIsPaused(true)
  }

  const handleTouchEnd = () => {
    setIsPaused(false)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  const currentItem = story.items[currentItemIndex]

  if (!currentItem) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div
        className="relative w-full h-full max-w-md mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Story content */}
        <div className="relative h-full w-full bg-black">
          {currentItem.type === "image" && currentItem.src && (
            <img src={currentItem.src || "/placeholder.svg"} alt="Story" className="h-full w-full object-contain" />
          )}
          {currentItem.type === "text" && (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-foreground p-8">
              <p className="text-2xl text-white text-center font-medium">{currentItem.caption}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-10">
          {story.items.map((_, index) => (
            <div key={index} className="h-1 bg-white/30 rounded-full flex-1">
              {index === currentItemIndex ? (
                <Progress value={progress} className="h-full" />
              ) : index < currentItemIndex ? (
                <div className="h-full bg-white rounded-full w-full" />
              ) : null}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={story.user.avatar || "/placeholder.svg"} alt={story.user.name} />
              <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{story.user.name}</p>
              <p className="text-white/70 text-xs">{formatTimestamp(currentItem.timestamp)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Caption */}
        {currentItem.caption && (
          <div className="absolute bottom-20 left-0 right-0 p-4 z-10">
            <p className="text-white text-sm">{currentItem.caption}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <button
          className="absolute top-1/2 left-2 transform -translate-y-1/2 h-full w-1/4 flex items-center justify-start z-10"
          onClick={(e) => {
            e.stopPropagation()
            goToPrevItem()
          }}
        >
          <ChevronLeft className="h-8 w-8 text-white/50" />
        </button>
        <button
          className="absolute top-1/2 right-2 transform -translate-y-1/2 h-full w-1/4 flex items-center justify-end z-10"
          onClick={(e) => {
            e.stopPropagation()
            goToNextItem()
          }}
        >
          <ChevronRight className="h-8 w-8 text-white/50" />
        </button>

        {/* Interaction buttons */}
        <div className="absolute bottom-4 left-0 right-0 p-4 flex items-center gap-4 z-10">
          <input
            type="text"
            placeholder="Reply..."
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2 text-sm border-none focus:outline-none"
          />
          <Button variant="ghost" size="icon" className="text-white">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

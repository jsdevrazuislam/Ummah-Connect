"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { react_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import updatePostInQueryData from "@/lib/update-post-data"

export type ReactionType = "like" | "love" | "haha" | "care" | "sad" | "wow" | "angry" | null

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void
  currentReaction: ReactionType
  id: number
}

export function ReactionPicker({ onReactionSelect, currentReaction, id }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const pickerRef = useRef<HTMLDivElement>(null)
  const { mutate } = useMutation({
    mutationFn: react_post,
    onSuccess: (updateData, variable) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
        return updatePostInQueryData(oldData, variable.id, updateData?.data)
      })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const reactions = [
    { type: "like", emoji: "👍", label: "Like" },
    { type: "love", emoji: "❤️", label: "Love" },
    { type: "haha", emoji: "😂", label: "Haha" },
    { type: "care", emoji: "🥰", label: "Care" },
    { type: "sad", emoji: "😢", label: "Sad" },
    { type: "wow", emoji: "😮", label: "Wow" },
    { type: "angry", emoji: "😡", label: "Angry" },
  ] as const

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleReactionClick = (reaction: ReactionType) => {
    if (reaction === currentReaction) {
      onReactionSelect(null)
    } else {
      onReactionSelect(reaction)
    }
    const payload = {
      react_type: reaction ?? '',
      icon: reactions.find((r) => r.type === reaction)?.emoji ?? '',
      id
    }
    mutate(payload)
    setIsOpen(false)
  }

  const getCurrentReactionEmoji = () => {
    if (!currentReaction) return null
    const reaction = reactions.find((r) => r.type === currentReaction)
    return reaction?.emoji
  }

  const getCurrentReactionColor = () => {
    switch (currentReaction) {
      case "like":
        return "text-blue-500"
      case "love":
        return "text-red-500"
      case "haha":
        return "text-yellow-500"
      case "care":
        return "text-orange-500"
      case "sad":
        return "text-purple-500"
      case "wow":
        return "text-yellow-500"
      case "angry":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        variant="ghost"
        size="sm"
        className={cn("text-muted-foreground gap-1", currentReaction && getCurrentReactionColor())}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        {currentReaction ? (
          <span className="text-lg mr-1">{getCurrentReactionEmoji()}</span>
        ) : (
          <ThumbsUp className="h-4 w-4" />
        )}
        <span>{currentReaction ? currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1) : ""}</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-background border border-border rounded-full shadow-lg z-10 p-1">
          <div className="flex">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                className={cn(
                  "h-10 w-10 flex items-center justify-center hover:bg-muted rounded-full text-xl transition-transform hover:scale-125",
                  currentReaction === reaction.type && "bg-muted scale-125",
                )}
                onClick={() => handleReactionClick(reaction.type)}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

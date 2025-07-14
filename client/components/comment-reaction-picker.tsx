"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { comment_react } from "@/lib/apis/comment"


interface CommentReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void
  currentReaction: ReactionType
  size?: "sm" | "default",
  id: number
  parentId: number
  postId: number
  isReply?: boolean
}

export function CommentReactionPicker({
  onReactionSelect,
  currentReaction,
  size = "default",
  id,
  postId,
  isReply,
  parentId
}: CommentReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const { mutate } = useMutation({
    mutationFn: comment_react,
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
      id,
      postId,
      parentId, 
      isReply
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
    <div className="relative -mt-[2px]" ref={pickerRef}>
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "text-muted-foreground p-0 h-auto",
          size === "sm" ? "text-xs" : "text-sm",
          currentReaction && getCurrentReactionColor(),
        )}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        {currentReaction ? (
          <span className={cn("mr-1", size === "sm" ? "text-sm" : "text-base")}>{getCurrentReactionEmoji()}</span>
        ) : (
          "Like"
        )}
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-background border border-border rounded-full shadow-lg z-10 p-1">
          <div className="flex">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                className={cn(
                  "h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full text-lg transition-transform hover:scale-125",
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

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { react_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import updatePostInQueryData from "@/lib/update-post-data"
import { motion, AnimatePresence } from "framer-motion"

export type ReactionType = "like" | "love" | "haha" | "care" | "sad" | "wow" | "angry" | null

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void
  currentReaction: ReactionType
  id: number
}

export function ReactionPicker({ onReactionSelect, currentReaction, id }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
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
    const newReaction = reaction === currentReaction ? null : reaction
    onReactionSelect(newReaction)
    
    const payload = {
      react_type: newReaction ?? '',
      icon: reactions.find((r) => r.type === newReaction)?.emoji ?? '',
      id
    }
    mutate(payload)
    setIsOpen(false)
  }

  const handleMainButtonClick = () => {
    if (currentReaction) {
      // Unlike if already reacted
      handleReactionClick(currentReaction)
    } else {
      // Default like if no reaction
      handleReactionClick("like")
    }
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
      <div className="flex items-center gap-1">
        {/* Main Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground gap-1 px-2",
            currentReaction && getCurrentReactionColor()
          )}
          onClick={handleMainButtonClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {currentReaction ? (
            <span className="text-lg">{getCurrentReactionEmoji()}</span>
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
          <span className="ml-1">
            {currentReaction ? currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1) : "Like"}
          </span>
        </Button>

        {/* Reaction Picker Trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-muted-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-xs">▼</span>
        </Button>
      </div>

      {/* Tooltip for main button */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            className="absolute bottom-full mb-2 left-0 bg-foreground text-background text-xs px-2 py-1 rounded"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.1 }}
          >
            {currentReaction ? "Remove reaction" : "Like"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction Picker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full mb-2 left-0 bg-background border border-border rounded-full shadow-lg z-10 p-1"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex">
              {reactions.map((reaction) => (
                <motion.button
                  key={reaction.type}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center hover:bg-muted rounded-full text-xl",
                    currentReaction === reaction.type && "bg-muted scale-125"
                  )}
                  onClick={() => handleReactionClick(reaction.type)}
                  title={reaction.label}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {reaction.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
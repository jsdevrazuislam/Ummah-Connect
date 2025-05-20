"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"

// Mock emoji data
const emojiCategories = [
  {
    name: "Smileys & Emotion",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  },
  {
    name: "People & Body",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤲", "👐", "🙌", "👏", "🤝", "👪", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "🧑"],
  },
  {
    name: "Animals & Nature",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐮", "🐷", "🐸", "🌱", "🌲", "🌳", "🌴"],
  },
  {
    name: "Food & Drink",
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑"],
  },
  {
    name: "Travel & Places",
    emojis: ["🕌", "🕋", "🏙️", "🌆", "🌇", "🌃", "🌉", "🏞️", "🏜️", "🏝️", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏗️"],
  },
]

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close emoji picker when clicking outside
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

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <Button type="button" size="icon" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
        <Smile className="h-5 w-5" />
        <span className="sr-only">Add emoji</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-background border border-border rounded-lg shadow-lg w-64 z-10">
          <div className="p-2 border-b border-border">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {emojiCategories.map((category, index) => (
                <Button
                  key={category.name}
                  variant={activeCategory === index ? "secondary" : "ghost"}
                  size="sm"
                  className="whitespace-nowrap text-xs"
                  onClick={() => setActiveCategory(index)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-2 h-48 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1">
              {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                <button
                  key={index}
                  className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-md text-lg"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

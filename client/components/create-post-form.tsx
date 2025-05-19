"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Smile, MapPin } from "lucide-react"

interface CreatePostFormProps {
  onSubmit: (content: string) => void
}

export function CreatePostForm({ onSubmit }: CreatePostFormProps) {
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content)
      setContent("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
          <AvatarFallback>YA</AvatarFallback>
        </Avatar>
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button type="button" size="icon" variant="ghost">
            <ImageIcon className="h-5 w-5" />
            <span className="sr-only">Add image</span>
          </Button>
          <Button type="button" size="icon" variant="ghost">
            <Smile className="h-5 w-5" />
            <span className="sr-only">Add emoji</span>
          </Button>
          <Button type="button" size="icon" variant="ghost">
            <MapPin className="h-5 w-5" />
            <span className="sr-only">Add location</span>
          </Button>
        </div>
        <Button type="submit" disabled={!content.trim()} className="rounded-full">
          Post
        </Button>
      </div>
    </form>
  )
}

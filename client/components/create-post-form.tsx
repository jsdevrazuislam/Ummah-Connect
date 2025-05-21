"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, X } from "lucide-react"
import { EmojiPicker } from "@/components/emoji-picker"
import { LocationPicker } from "@/components/location-picker"
import { ImageUpload } from "@/components/image-upload"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create_post } from "@/lib/apis/posts"
import { toast } from "sonner"

interface CreatePostFormProps {
  onAIHelp?: () => void
}

export function CreatePostForm({ onAIHelp }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; city: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: create_post,
    onSuccess: (newPost) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {
        if (!oldData || !oldData.data || !Array.isArray(oldData.data.posts)) {
          return {
            data: {
              posts: [newPost.data],
              totalPages: 1,
              currentPage: 1
            },
          };
        }
        return {
          ...oldData,
          data: {
            posts: [newPost.data, ...oldData.data.posts]
          }
        }
      })
      setContent("")
      setSelectedImage(undefined)
      setSelectedLocation(null)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const isButtonDisabled = isPending || (!content.trim() && !selectedImage);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !selectedImage) {
      return;
    }
    const formData = new FormData()
    if (selectedImage) {
      formData.append("media", selectedImage)
    }
    formData.append("content", content)
    if (selectedLocation) {
      formData.append("location", `${selectedLocation?.name}, ${selectedLocation?.city}`)
    }
    formData.append("privacy", "public")
    mutate(formData)

  }

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    }
  }

  const handleLocationSelect = (location: { name: string; city: string }) => {
    setSelectedLocation(location)
  }

  const handleLocationRemove = () => {
    setSelectedLocation(null)
  }

  const handleImageSelect = (imageUrl: File) => {
    setSelectedImage(imageUrl)
  }

  const handleImageRemove = () => {
    setSelectedImage(undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {
        isPending && <div className="absolute -top-4 left-0 w-full h-full bg-black/50  flex justify-center items-center flex-col z-40">
          <Loader2 className="animate-spin h-8 w-8" />
          Posting...
        </div>
      }
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
          <AvatarFallback>YA</AvatarFallback>
        </Avatar>
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
        />
      </div>

      {selectedLocation && (
        <div className="flex items-center">
          <Badge variant="outline" className="flex gap-1 ml-12">
            <span>
              📍 {selectedLocation.name}, {selectedLocation.city}
            </span>
            <button type="button" onClick={handleLocationRemove} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {selectedImage && (
        <div className="ml-12">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
              alt="Selected"
              className="w-full h-auto max-h-[200px] object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={handleImageRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <ImageUpload
            onImageSelect={handleImageSelect}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <LocationPicker onLocationSelect={handleLocationSelect} />
          <Button type="button" size="icon" variant="ghost" className="text-primary" onClick={onAIHelp}>
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">AI Help</span>
          </Button>
        </div>
        <Button type="submit" disabled={isButtonDisabled} className="rounded-full">
          Post
        </Button>
      </div>
    </form>
  )
}

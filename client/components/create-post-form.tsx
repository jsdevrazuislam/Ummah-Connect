"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, X } from "lucide-react"
import { EmojiPicker } from "@/components/emoji-picker"
import { LocationPicker } from "@/components/location-picker"
import { ImageUpload } from "@/components/image-upload"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Lock, Users, User } from "lucide-react"
import LoadingUi from "./ui-loading"

interface CreatePostFormProps {
  onAIHelp?: () => void
}

export function CreatePostForm({ onAIHelp }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; city: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()
  const [visibility, setVisibility] = useState<"public" | "friends" | "private" | "only_me">("public")

  const { mutate, isPending } = useMutation({
    mutationFn: create_post,
    onSuccess: (newPost) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {

        const updatedPages = oldData?.pages?.map((page) => {
          if (page?.data?.posts?.length === 0) {
            return {
              ...page,
              data: {
                posts: [newPost.data],
                totalPages: 1,
                currentPage: 1
              },
            };
          }
          return {
            ...page,
            data: {
              ...page.data,
              posts: [newPost.data, ...(page?.data?.posts ?? [])]
            }
          }
        })

        return {
          ...oldData,
          pages: updatedPages
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
    formData.append("privacy", visibility)
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
        isPending && <LoadingUi title="Posting" className='-top-4' />
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {visibility === "public" && <Globe className="h-4 w-4" />}
                {visibility === "friends" && <Users className="h-4 w-4" />}
                {visibility === "private" && <Lock className="h-4 w-4" />}
                {visibility === "only_me" && <User className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {visibility === "public"
                    ? "Public"
                    : visibility === "friends"
                      ? "Friends"
                      : visibility === "private"
                        ? "Private"
                        : "Only me"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setVisibility("public")} className="gap-2">
                <Globe className="h-4 w-4" />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can see this post</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("friends")} className="gap-2">
                <Users className="h-4 w-4" />
                <div>
                  <p className="font-medium">Friends</p>
                  <p className="text-xs text-muted-foreground">Only your friends can see this post</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("private")} className="gap-2">
                <Lock className="h-4 w-4" />
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-xs text-muted-foreground">Only you and mentioned users can see this post</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("only_me")} className="gap-2">
                <User className="h-4 w-4" />
                <div>
                  <p className="font-medium">Only me</p>
                  <p className="text-xs text-muted-foreground">Only you can see this post</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="submit" disabled={!content.trim()} className="rounded-full">
            Post
          </Button>
        </div>
      </div>
    </form>
  )
}

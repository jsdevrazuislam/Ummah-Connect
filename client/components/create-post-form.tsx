"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Smile, Sparkles, X } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"
import { ImageUpload } from "@/components/image-upload"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Lock, Users, User } from "lucide-react"
import LoadingUi from "@/components/ui-loading"
import { useAuthStore } from "@/store/store"
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes"

interface CreatePostFormProps {
  onAIHelp?: () => void
}

export function CreatePostForm({ onAIHelp }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; city: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()
  const [visibility, setVisibility] = useState<"public" | "friends" | "private" | "only me">("public")
  const { user, setIsOpen } = useAuthStore()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme()

  const { mutate, isPending } = useMutation({
    mutationFn: create_post,
    onSuccess: (newPost) => {
      setIsOpen(false)
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
      setSelectedFile(undefined)
      setSelectedLocation(null)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !selectedFile) {
      return;
    }
    const formData = new FormData()
    if (selectedFile) {
      formData.append("media", selectedFile)
    }
    formData.append("content", content)
    if (selectedLocation) {
      formData.append("location", `${selectedLocation?.name}, ${selectedLocation?.city}`)
    }
    formData.append("privacy", visibility)
    mutate(formData)

  }

  const handleLocationSelect = (location: { name: string; city: string }) => {
    setSelectedLocation(location)
  }

  const handleLocationRemove = () => {
    setSelectedLocation(null)
  }

  const handleImageSelect = (imageUrl: File) => {
    setSelectedFile(imageUrl)
  }

  const handleFileRemove = () => {
    setSelectedFile(undefined)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-label="emoji-picker"]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
   <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="sticky top-0 p-4 z-10 bg-background border-b border-border">
        <h1 className="text-xl font-semibold text-center">Create Post</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isPending && <LoadingUi title="Posting" className="absolute inset-0 bg-background/80 z-20" />}
        
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={`${user?.avatar}?height=40&width=40`} alt={user?.full_name} />
            <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[100px]"
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

        {selectedFile && (
          <div className="ml-12 relative">
            <div className="rounded-lg overflow-hidden border border-border">
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Play className="h-12 w-12 text-white/80" />
                  </div>
                  <video
                    src={URL.createObjectURL(selectedFile)}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              )}

              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={handleFileRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 bg-background border-t border-border p-4">
        <div className="flex justify-between items-center">
          <div className="flex relative gap-2">
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-0 mb-3 left-2 z-50">
                <Picker
                  data={emojiData}
                  onEmojiSelect={(emoji: EmojiPicker) => setContent(prev => prev + emoji.native)}
                  theme={theme}
                  previewPosition="none"
                  searchPosition="none"
                />
              </div>
            )}
            <ImageUpload
              onImageSelect={handleImageSelect}
              accept="image/*, video/*"
            />
            <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} type="button" variant="ghost" size="icon" className="shrink-0">
              <Smile className="h-5 w-5" />
            </Button>
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
                  {visibility === "only me" && <User className="h-4 w-4" />}
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
                <DropdownMenuItem onClick={() => setVisibility("only me")} className="gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Only me</p>
                    <p className="text-xs text-muted-foreground">Only you can see this post</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="submit" disabled={!content.trim() && !selectedFile} className="rounded-full">
              Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

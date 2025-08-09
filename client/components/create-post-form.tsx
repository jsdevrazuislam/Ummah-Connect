"use client";

import type React from "react";

import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock, Play, Smile, User, Users, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ImageUpload } from "@/components/image-upload";
import { LocationPicker } from "@/components/location-picker";
import LoadingUi from "@/components/ui-loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/apis/posts";
import { showError } from "@/lib/toast";
import { useStore } from "@/store/store";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; city: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState<"public" | "friends" | "private" | "only me">("public");
  const { user, setIsOpen, setUser } = useStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [background, setBackground] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      setIsOpen(false);
      queryClient.setQueryData(["get_all_posts"], (oldData: QueryOldDataPayload) => {
        const updatedPages = oldData?.pages?.map((page) => {
          if (page?.data?.posts?.length === 0) {
            return {
              ...page,
              data: {
                posts: [newPost.data],
                totalPages: 1,
                currentPage: 1,
              },
            };
          }
          return {
            ...page,
            data: {
              ...page.data,
              posts: [newPost.data, ...(page?.data?.posts ?? [])],
            },
          };
        });

        return {
          ...oldData,
          pages: updatedPages,
        };
      });
      setContent("");
      setSelectedFile(undefined);
      setSelectedLocation(null);
      if (user)
        setUser({ ...user, totalPosts: user?.totalPosts + 1 });
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) {
      return;
    }
    const formData = new FormData();
    if (selectedFile) {
      formData.append("media", selectedFile);
    }
    formData.append("background", background);
    formData.append("content", content);
    if (selectedLocation) {
      formData.append("location", `${selectedLocation?.name}, ${selectedLocation?.city}`);
    }
    formData.append("privacy", visibility);
    mutate(formData);
  };

  const handleLocationSelect = (location: { name: string; city: string }) => {
    setSelectedLocation(location);
  };

  const handleLocationRemove = () => {
    setSelectedLocation(null);
  };

  const handleImageSelect = (imageUrl: File) => {
    if (background)
      return;
    setSelectedFile(imageUrl);
  };

  const handleFileRemove = () => {
    setSelectedFile(undefined);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current
        && !emojiPickerRef.current.contains(event.target as Node)
        && !(event.target as Element).closest("button[aria-label=\"emoji-picker\"]")
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
            {user?.avatar
              ? <AvatarImage src={user?.avatar} alt={user?.fullName} />
              : <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback> }
          </Avatar>
          <div>
            <p>{user?.fullName}</p>
            <span className="text-gray-400">
              @
              {user?.username}
            </span>
          </div>
        </div>
        <div className={`rounded-lg ${background} transition-colors duration-200`}>
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            className={`flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] ${background.startsWith("bg-gradient") ? "text-white placeholder:text-white/70" : ""
            }`}
            style={{
              backgroundColor: "transparent",
              color: background.startsWith("bg-gradient") ? "white" : "inherit",
            }}
          />
        </div>

        {
  !selectedFile && (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[
        "bg-gray-100",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-purple-500",
        "bg-gradient-to-r from-blue-400 to-purple-500",
        "bg-gradient-to-r from-pink-400 to-red-500",
        "bg-gradient-to-r from-green-400 to-blue-500",
        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
        "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500",
        "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500",
        "bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500",
      ].map(bgClass => (
        <button
          key={bgClass}
          type="button"
          onClick={() => setBackground(bgClass)}
          className={`w-8 h-8 rounded-full ${bgClass} border-2 ${
            background === bgClass ? "border-primary" : "border-transparent"
          }`}
          aria-label={`Select ${bgClass} background`}
        />
      ))}

      {/* Clear background option */}
      <button
        type="button"
        onClick={() => setBackground("")}
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
          background === "" ? "border-primary" : "border-muted"
        }`}
        aria-label="Clear background"
      >
        ✕
      </button>
    </div>
  )
}

        {selectedLocation && (
          <div className="flex items-center">
            <Badge variant="outline" className="flex gap-1 ml-12">
              <span>
                📍
                {" "}
                {selectedLocation.name}
                ,
                {" "}
                {selectedLocation.city}
              </span>
              <button type="button" onClick={handleLocationRemove} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {selectedFile && (
          <div className="relative">
            <div className="rounded-lg overflow-hidden border border-border">
              {selectedFile.type.startsWith("image/")
                ? (
                    <Image
                      src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                      alt={user?.fullName ?? ""}
                      className="w-full h-full object-cover"
                      width={200}
                      height={200}
                    />
                  )
                : (
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
              disabled={!!background}
            />
            <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} type="button" variant="ghost" size="icon" className="shrink-0">
              <Smile className="h-5 w-5" />
            </Button>
            <LocationPicker onLocationSelect={handleLocationSelect} />
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
  );
}

"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Send } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface User {
  name: string
  username: string
  avatar: string
}

interface Comment {
  id: string
  user: User
  content: string
  timestamp: string
  likes: number
}

interface PostProps {
  post: {
    id: string
    user: User
    content: string
    timestamp: string
    likes: number
    comments: number
    shares: number
    image?: string
    commentsList?: Comment[]
  }
}

export function Post({ post }: PostProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>(
    post.commentsList || [
      {
        id: "c1",
        user: {
          name: "Ibrahim Khan",
          username: "ibrahim_k",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "JazakAllah Khair for sharing this beautiful reminder!",
        timestamp: "15m ago",
        likes: 3,
      },
      {
        id: "c2",
        user: {
          name: "Aisha Rahman",
          username: "aisha_r",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "SubhanAllah, this is so inspiring.",
        timestamp: "45m ago",
        likes: 5,
      },
    ],
  )

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: `c-${Date.now()}`,
        user: {
          name: "You",
          username: "current_user",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: commentText,
        timestamp: "Just now",
        likes: 0,
      }
      setComments([...comments, newComment])
      setCommentText("")
    }
  }

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">{post.user.name}</span>{" "}
              <span className="text-muted-foreground">
                @{post.user.username} · {post.timestamp}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Bookmark</DropdownMenuItem>
                <DropdownMenuItem>Not interested</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 text-sm">{post.content}</div>

          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
              <Share className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          {showComments && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Your avatar" />
                  <AvatarFallback>YA</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                      <div className="flex gap-4 mt-1 ml-2">
                        <button className="text-xs text-muted-foreground hover:text-foreground">Like</button>
                        <button className="text-xs text-muted-foreground hover:text-foreground">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

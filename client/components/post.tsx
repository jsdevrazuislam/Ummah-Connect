"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Share,
  MoreHorizontal,
  Bookmark,
  Send,
  Sparkles,
  MapPin,
  Pencil,
  Trash,
  Check,
  X,
  Link2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { AITranslation } from "@/components/ai-translation"
import { AIContentModerationBanner } from "@/components/ai-content-moderation-banner"
import { Badge } from "@/components/ui/badge"
import { ReactionPicker, type ReactionType } from "@/components/reaction-picker"
import { CommentItem, type Comment as CommentType } from "@/components/comment-item"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface User {
  name: string
  username: string
  avatar: string
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
    location?: {
      name: string
      city: string
    }
    commentsList?: CommentType[]
    needsModeration?: boolean
    reactions?: {
      [key in ReactionType]?: number
    }
    isBookmarked?: boolean
  }
  currentUser?: User
  onDelete?: (postId: string) => void
  onEdit?: (postId: string, content: string, image?: string, location?: { name: string; city: string }) => void
}

export function Post({ post, currentUser, onDelete, onEdit }: PostProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [showModeration, setShowModeration] = useState(post.needsModeration || false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(null)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(post.content)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [comments, setComments] = useState<CommentType[]>(
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
        reactions: { like: 3 },
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
        reactions: { love: 5 },
        replies: [
          {
            id: "r1",
            user: {
              name: "Omar Farooq",
              username: "omar_f",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            content: "I completely agree, sister Aisha!",
            timestamp: "30m ago",
            reactions: { like: 2 },
          },
        ],
      },
    ],
  )

  const isCurrentUserPost = currentUser && post.user.username === currentUser.username

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: CommentType = {
        id: `c-${Date.now()}`,
        user: {
          name: currentUser?.name || "You",
          username: currentUser?.username || "current_user",
          avatar: currentUser?.avatar || "/placeholder.svg?height=40&width=40",
        },
        content: commentText,
        timestamp: "Just now",
        reactions: {},
      }
      setComments([...comments, newComment])
      setCommentText("")
    }
  }

  const handleReviewContent = (postId: string) => {
    // In a real app, this would open a detailed review UI
    console.log(`Reviewing post ${postId}`)
  }

  const handleDismissModeration = (postId: string) => {
    setShowModeration(false)
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(
      comments.filter((comment) => {
        // Check if this is the comment to delete
        if (comment.id === commentId) return false

        // If this comment has replies, check if the reply should be deleted
        if (comment.replies) {
          comment.replies = comment.replies.filter((reply) => reply.id !== commentId)
        }

        return true
      }),
    )
  }

  const handleEditComment = (commentId: string, content: string) => {
    setComments(
      comments.map((comment) => {
        // Check if this is the comment to edit
        if (comment.id === commentId) {
          return { ...comment, content }
        }

        // Check if the comment to edit is in the replies
        if (comment.replies) {
          comment.replies = comment.replies.map((reply) => (reply.id === commentId ? { ...reply, content } : reply))
        }

        return comment
      }),
    )
  }

  const handleCommentReaction = (commentId: string, reaction: ReactionType) => {
    // In a real app, this would update the backend
    console.log(`Reaction ${reaction} on comment ${commentId}`)
  }

  const handleReplyToComment = (commentId: string, content: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const newReply = {
            id: `r-${Date.now()}`,
            user: {
              name: currentUser?.name || "You",
              username: currentUser?.username || "current_user",
              avatar: currentUser?.avatar || "/placeholder.svg?height=40&width=40",
            },
            content,
            timestamp: "Just now",
            reactions: {},
          }

          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          }
        }
        return comment
      }),
    )
  }

  const handleDeletePost = () => {
    if (onDelete) {
      onDelete(post.id)
    }
  }

  const handleEditPost = () => {
    if (onEdit && editText.trim()) {
      onEdit(post.id, editText, post.image, post.location)
      setIsEditing(false)
    }
  }

  const handleSharePost = () => {
    // In a real app, this would copy the link to clipboard or open share options
    const postUrl = `https://ummahconnect.com/post/${post.id}`
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast({
          title: "Link copied to clipboard",
          description: "You can now share this post with others",
        })
        setShowShareDialog(false)
      })
      .catch(() => {
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        })
      })
  }

  // Get total reactions count
  const getTotalReactions = () => {
    if (post.reactions) {
      return Object.values(post.reactions).reduce((sum, count) => sum + (count || 0), 0)
    }
    return post.likes || 0
  }

  return (
    <div className="border-b border-border p-4">
      {showModeration && (
        <AIContentModerationBanner
          postId={post.id}
          content={post.content}
          onReview={handleReviewContent}
          onDismiss={handleDismissModeration}
        />
      )}

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
                <DropdownMenuItem onClick={() => setIsBookmarked(!isBookmarked)}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  {isBookmarked ? "Remove bookmark" : "Bookmark"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTranslation(!showTranslation)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showTranslation ? "Hide translation" : "Translate post"}
                </DropdownMenuItem>

                {isCurrentUserPost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete post
                    </DropdownMenuItem>
                  </>
                )}

                {!isCurrentUserPost && (
                  <DropdownMenuItem>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Not interested
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[100px]" />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleEditPost}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm">{post.content}</div>
          )}

          {post.location && !isEditing && (
            <div className="mt-2">
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span>
                  {post.location.name}, {post.location.city}
                </span>
              </Badge>
            </div>
          )}

          {showTranslation && !isEditing && <AITranslation originalText={post.content} />}

          {post.image && !isEditing && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <div className="flex items-center gap-2">
              <ReactionPicker onReactionSelect={setCurrentReaction} currentReaction={currentReaction} />
              <span className="text-sm text-muted-foreground">{getTotalReactions()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowShareDialog(true)}
            >
              <Share className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={isBookmarked ? "text-primary" : "text-muted-foreground"}
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
            </Button>
          </div>

          {showComments && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={currentUser?.name || "Your avatar"}
                  />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || "Y"}</AvatarFallback>
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

              <div className="space-y-4 pt-2">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReplyToComment}
                    onDelete={handleDeleteComment}
                    onEdit={handleEditComment}
                    onReaction={handleCommentReaction}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>Share this post with your friends and followers</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input value={`https://ummahconnect.com/post/${post.id}`} readOnly className="flex-1" />
              <Button onClick={handleSharePost}>
                <Link2 className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" className="flex-1">
                Share to Feed
              </Button>
              <Button variant="outline" className="flex-1">
                Message
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

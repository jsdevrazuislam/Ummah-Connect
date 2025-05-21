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
import { CommentItem, } from "@/components/comment-item"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/store/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { delete_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import { create_comment } from "@/lib/apis/comment"


interface PostProps {
  post: PostsEntity
  onDelete?: (postId: number) => void
}

export function Post({ post, onDelete }: PostProps) {
  const { user } = useAuthStore()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(post?.reactions?.currentUserReaction ?? null)
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(post?.content)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const isCurrentUserPost = user && post?.user?.username === user?.username
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: delete_post,
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: mnFun, isPending } = useMutation({
    mutationFn: create_comment,
    onSuccess: (newComment, variable) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {

        const updatedPosts = oldData?.data?.posts?.map((post) => {

          if (post.id === variable.postId) {
            return {
              ...post,
              comments: {
                total: post.comments.total + 1,
                preview: [newComment.data, ...(post.comments.preview ?? [])]
              }
            }
          }
          return post
        })

        return {
          ...oldData,
          data: {
            ...oldData.data,
            posts: updatedPosts
          }
        }
      })
      setCommentText("")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleAddComment = () => {
    if (commentText.trim()) {
      const payload = {
        content: commentText,
        postId: post.id
      }
      mnFun(payload)
    }
  }

  const handleReviewContent = (postId: number) => {
    console.log(`Reviewing post ${postId}`)
  }

  const handleDeleteComment = (commentId: number) => {
  
  }

  const handleEditComment = (commentId: number, content: string) => {
   
  }

  const handleCommentReaction = (commentId: number, reaction: ReactionType) => {
    // In a real app, this would update the backend
    console.log(`Reaction ${reaction} on comment ${commentId}`)
  }

  const handleReplyToComment = (commentId: number, content: string) => {

  }

  const handleDeletePost = () => {
    if (onDelete) {
      onDelete(post.id)
      mutate(post.id)
    }
  }

  const handleEditPost = () => {
    if (editText.trim()) {
      setIsEditing(false)
    }
  }

  const handleSharePost = () => {
    const postUrl = `https://ummahconnect.com/post/${post.id}`
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast.success("Link copied to clipboard", {
          description: "You can now share this post with others",
        })
        setShowShareDialog(false)
      })
      .catch(() => {
        toast.error("Failed to copy link", {
          description: "Please try again",
        })
      })
  }

  const getTotalReactions = () => {
    if (post.reactions) {
      return Object.values(post.reactions.counts).reduce((sum, count) => sum + (count || 0), 0)
    }
    return post.likes || 0
  }

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={post?.user?.avatar || "/placeholder.svg"} alt={post?.user?.name} />
          <AvatarFallback>{post?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold capitalize">{post?.user?.name}</span>{" "}
              <span className="text-muted-foreground">
                @{post?.user?.username} · {post?.timestamp}
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
            <div className="mt-2 text-sm">{post?.content}</div>
          )}

          {post?.location && !isEditing && (
            <div className="mt-2">
              <Badge variant="outline" className="flex w-fit items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span>
                  {post?.location}
                </span>
              </Badge>
            </div>
          )}

          {showTranslation && !isEditing && <AITranslation originalText={post.content} />}

          {post?.image && !isEditing && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img
                src={post?.image || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <div className="flex items-center gap-2">
              <ReactionPicker id={post.id} onReactionSelect={setCurrentReaction} currentReaction={currentReaction} />
              <span className="text-sm text-muted-foreground">{getTotalReactions()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post?.comments?.total}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowShareDialog(true)}
            >
              <Share className="h-4 w-4" />
              <span>{post?.shares}</span>
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
                    src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={user?.full_name || "Your avatar"}
                  />
                  <AvatarFallback>{user?.full_name?.charAt(0) || "Y"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1"
                    disabled={isPending}
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim() || isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {post?.comments?.preview?.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReplyToComment}
                    onDelete={handleDeleteComment}
                    onEdit={handleEditComment}
                    onReaction={handleCommentReaction}
                    currentUser={comment.user}
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

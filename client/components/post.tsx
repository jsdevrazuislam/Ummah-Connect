"use client"

import { useEffect, useState } from "react"
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
import { useAuthStore } from "@/store/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookmark_post, delete_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import { create_comment } from "@/lib/apis/comment"
import { SharePostDialog } from "@/components/share-post-dialog"
import EditPostModel from "@/components/edit-post-model"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import { addCommentToPost } from "@/lib/update-post-data"
import { formatTimeAgo } from "@/lib/utils"


interface PostProps {
  post: PostsEntity
}

export function Post({ post }: PostProps) {
  const { user } = useAuthStore()
  const { socket } = useSocketStore()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(post?.reactions?.currentUserReaction ?? null)
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false)
  const [isEditing, setIsEditing] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const isCurrentUserPost = user && post?.user?.username === user?.username
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: delete_post,
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: bookmarkFunc, } = useMutation({
    mutationFn: bookmark_post,
    onSuccess: () => {
      setIsBookmarked(!isBookmarked)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: mnFun, isPending } = useMutation({
    mutationFn: create_comment,
    onSuccess: (newComment, variable) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {
        return addCommentToPost(oldData, variable.postId, newComment.data)
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


  const handleCommentReaction = (commentId: number, reaction: ReactionType) => {
    // In a real app, this would update the backend
    console.log(`Reaction ${reaction} on comment ${commentId}`)
  }



  const handleDeletePost = () => {
    queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {
      const updatedPost = oldData?.data?.posts?.filter((newPost) => newPost.id !== post.id)
      return {
        ...oldData,
        data: {
          ...oldData.data,
          posts: updatedPost
        }
      }
    })
    mutate(post.id)
  }

  const getTotalReactions = () => {
    if (post?.reactions?.counts && Object.keys(post?.reactions?.counts).length > 0) {
      return Object.values(post?.reactions?.counts).reduce((sum, count) => sum + (count || 0), 0)
    }
    return 0
  }

  useEffect(() => {
    if (!socket) return;
    socket.emit(SocketEventEnum.JOIN_POST, post.id.toString());
    return () => {
      socket.off(SocketEventEnum.JOIN_POST);
    };
  }, [socket, post]);

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={post?.user?.avatar || "/placeholder.svg"} alt={post?.user?.full_name} />
          <AvatarFallback>{post?.user?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold capitalize">{post?.user?.full_name}</span>{" "}
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
                <DropdownMenuItem disabled={isPending} onClick={() => bookmarkFunc(post.id)}>
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

          {
            post?.originalPost ? <div className="mt-2 border dark:border-gray-500 rounded-lg bg-muted/30">

              {
                post.originalPost?.media && <div className="overflow-hidden rounded-t-lg border border-border">
                  <img
                    src={post?.originalPost?.media || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              }

              <div className="px-4 py-2">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={post.originalPost?.user?.avatar || "/placeholder.svg"} alt={post.originalPost?.user?.full_name} />
                    <AvatarFallback>{post.originalPost?.user?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold capitalize">{post.originalPost?.user?.full_name}</span>{" "}
                    <p className="text-muted-foreground">
                      {formatTimeAgo(new Date(post?.originalPost?.createdAt ?? ''))}
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                {post?.originalPost?.content}
                </p>
              </div>


            </div> : <div className="mt-2 text-sm">{post.content}</div>
          }
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
              onClick={() => bookmarkFunc(post.id)}
              disabled={isPending}
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
                    onReaction={handleCommentReaction}
                    postId={post.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <EditPostModel post={post} showEditDialog={isEditing} setShowEditDialog={setIsEditing} />
      <SharePostDialog
        postId={post.id}
        postUsername={post.user.username}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </div>
  )
}

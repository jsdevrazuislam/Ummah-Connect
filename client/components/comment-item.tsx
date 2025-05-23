"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, MoreHorizontal, Send, Pencil, Trash, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CommentReactionPicker } from "@/components/comment-reaction-picker"
import { AITranslation } from "@/components/ai-translation"
import { Textarea } from "@/components/ui/textarea"
import { formatTimeAgo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { delete_comment, edit_comment, reply_comment } from "@/lib/apis/comment"
import { toast } from "sonner"
import { useAuthStore } from "@/store/store"


interface CommentItemProps {
  comment: CommentPreview
  isReply?: boolean
  postId: number
  onReaction?: (commentId: number, reaction: ReactionType) => void
}

export function CommentItem({
  comment,
  isReply = false,
  onReaction,
  postId
}: CommentItemProps) {
  const { user } = useAuthStore()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(comment?.reactions?.currentUserReaction ?? null)
  const isCurrentUserComment = user && comment.user.username === user.username

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: reply_comment,
    onSuccess: (newComment, variable) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {

        const updatedPost = oldData?.data?.posts?.map((post) => {

          if (post.id === variable.postId) {

            const updatedComments = post?.comments?.preview?.map((comment) => {

              if (comment.id === variable.id) {
                return {
                  ...comment,
                  replies: [newComment.data, ...(comment.replies ?? [])]
                }
              }
              return comment
            })

            return {
              ...post,
              comments: {
                total: post.comments.total + 1,
                preview: updatedComments
              }

            }
          }

          return post
        })

        return {
          ...oldData,
          data: {
            posts: updatedPost
          }
        }

      })
      setReplyText("")
      setShowReplyForm(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: editMnFun, isPending: editLoading } = useMutation({
    mutationFn: edit_comment,
    onSuccess: (updatedComment, variable) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {

        const updatedPosts = oldData?.data?.posts?.map((post) => {

          if (post.id === variable.postId) {

            const updatedComments = post?.comments?.preview?.map((comment) => {
              if (comment.id === variable.commentId) {
                return {
                  ...comment,
                  ...updatedComment.data
                }
              }

              if (updatedComment.data.isReply) {

                const updatedRepliesComments = comment?.replies?.map((reply) => {

                  if (reply.parentId === updatedComment.data.parentId && reply.id === updatedComment.data.id) {
                    return {
                      ...reply,
                      ...updatedComment.data
                    }
                  }

                  return reply
                })

                return {
                  ...comment,
                  replies: updatedRepliesComments
                }
              }
              return comment
            })

            return {
              ...post,
              comments: {
                ...post.comments,
                preview: updatedComments
              }
            }
          }

          return post
        })

        return {
          ...oldData,
          data: {
            posts: updatedPosts
          }
        }
      })
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: deleteMuFunc } = useMutation({
    mutationFn: delete_comment,
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleReply = () => {
    if (replyText.trim()) {
      const payload = {
        content: replyText,
        postId,
        id: comment.id,
      }
      mutate(payload)
    }
  }

  const handleEdit = () => {
    if (editText.trim()) {
      const payload = {
        content: editText.trim(),
        commentId: comment.id,
        postId,
        isReply,
      }
      editMnFun(payload)
    }
  }

  const handleDelete = (commentId: number, parentId: number) => {
    queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {

      const updatedPosts = oldData?.data?.posts?.map((post) => {

        let commentsRemovedCount = 0;


        if (post.id === postId) {

          const updatedComments = post?.comments?.preview?.map((commentData) => {

            if (isReply && commentData.id === parentId) {
              const initialRepliesCount = commentData.replies?.length || 0;
              const updatedRepliesComments = commentData?.replies?.filter((repComment) => repComment.id !== commentId)
              const finalRepliesCount = updatedRepliesComments?.length || 0;

              if (initialRepliesCount > finalRepliesCount) {
                commentsRemovedCount += 1;
              }

              return {
                ...commentData,
                replies: updatedRepliesComments
              }
            }

            if (!isReply && commentData.id === commentId) {
              commentsRemovedCount += 1;
              commentsRemovedCount += commentData.replies?.length || 0;
              return null;
            }

            return commentData
          }).filter(Boolean)

          const newTotalComments = post.comments.total - commentsRemovedCount;

          return {
            ...post,
            comments: {
              total: Math.max(0, newTotalComments),
              preview: updatedComments
            }
          }
        }

        return post
      })

      return {
        ...oldData,
        data: {
          posts: updatedPosts
        }
      }
    })
    deleteMuFunc(commentId)
  }

  const handleReaction = (reaction: ReactionType) => {
    setCurrentReaction(reaction)
    if (onReaction) {
      onReaction(comment.id, reaction)
    }
  }

  const getTotalReactions = () => {
    if (Object.keys(comment.reactions.counts).length == 0) return 0
    return Object.values(comment.reactions.counts).reduce((sum, count) => sum + (count || 0), 0)
  }

  return (
    <div className={`flex gap-2 ${isReply ? "ml-8 mt-3" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment?.user?.avatar || "/placeholder.svg"} alt={comment.user?.full_name} />
        <AvatarFallback>{comment?.user?.full_name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex justify-between items-center">
            <span className="font-medium capitalize text-sm">{comment?.user?.full_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(comment.createdAt))}</span>
              {isCurrentUserComment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(comment.id, comment.parentId)} className="text-destructive">
                      <Trash className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] text-sm"
                disabled={editLoading}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button disabled={editLoading} size="sm" onClick={handleEdit}>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1">{comment.content}</p>
          )}
        </div>

        {showTranslation && !isEditing && (
          <div className="mt-2">
            <AITranslation originalText={comment.content} />
          </div>
        )}

        <div className="flex gap-4 mt-1 ml-2 items-center">
          <div className="flex items-center gap-1">
            <CommentReactionPicker isReply={isReply} postId={postId} parentId={comment.parentId} id={comment.id} onReactionSelect={handleReaction} currentReaction={currentReaction} size="sm" />
            {getTotalReactions() > 0 && <span className="text-xs text-muted-foreground">{getTotalReactions()}</span>}
          </div>

          {!isReply && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>
          )}

          <button
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            <Sparkles className="h-3 w-3" />
            {showTranslation ? "Hide Translation" : "Translate"}
          </button>
          {
            comment.isEdited && <button className="text-xs text-muted-foreground hover:text-foreground">Edited</button>
          }
        </div>

        {showReplyForm && (
          <div className="mt-3 flex gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={user?.avatar || "/placeholder.svg?height=24&width=24"}
                alt={user?.full_name || "You"}
              />
              <AvatarFallback>{user?.full_name?.charAt(0) || "Y"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 h-8 text-xs"
                disabled={isPending}
              />
              <Button size="sm" className="h-8" onClick={handleReply} disabled={!replyText.trim() || isPending}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setShowReplies(!showReplies)}>
              {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
              {comment?.replies?.length === 1 ? "reply" : "replies"}
            </Button>

            {showReplies && (
              <div className="mt-2 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    onReaction={onReaction}
                    postId={postId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

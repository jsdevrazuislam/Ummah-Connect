"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, MoreHorizontal, Send, Pencil, Trash, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CommentReactionPicker } from "@/components/comment-reaction-picker"
import { Textarea } from "@/components/ui/textarea"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { delete_comment, edit_comment, get_comments, reply_comment } from "@/lib/apis/comment"
import { toast } from "sonner"
import { useAuthStore } from "@/store/store"
import {  editCommentToPost } from "@/lib/update-post-data"
import { Skeleton } from "@/components//ui/skeleton"
import { InfiniteScroll } from "@/components/infinite-scroll"
import CardHoverTooltip from "./card-hover-tooltip"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from 'date-fns';
import Link from "next/link"

function parseMentions(content: string): React.ReactNode[] {
  const parts = content.split(/(@\w+)/g); // splits on @username
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <Link
          key={index}
          href={`/${username}`}
          className="text-blue-500 hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}


interface CommentItemProps {
  comment: CommentPreview
  isReply?: boolean
  postId: number
  setTotalComment?: React.Dispatch<React.SetStateAction<number>>

}

export const CommentItems = ({ postId, totalComment, setTotalComment }: { postId: number, totalComment: number | undefined, setTotalComment?: React.Dispatch<React.SetStateAction<number>> }) => {

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<CommentsResponse>({
    queryKey: ['get_comments', postId],
    queryFn: ({ pageParam = 1 }) => get_comments({ page: Number(pageParam), id: postId, limit: 10 }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage?.data?.currentPage + 1;
      if (nextPage <= lastPage?.data?.totalPages) {
        return nextPage;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: postId && totalComment !== 0 ? true : false
  });

  const comments = data?.pages?.flatMap(page => page?.data?.comments ?? []) || [];

  const handleLoadMoreComments = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };


  if (isError) {
    return <div className="text-red-500 text-center py-4">Error loading posts: {error?.message}</div>;
  }

  return (
    <InfiniteScroll className="h-0" hasMore={hasNextPage} isLoading={isFetchingNextPage} onLoadMore={handleLoadMoreComments}>
      {
        isLoading ? Array(5).fill(5).map((_, index) => (
          <div key={index} className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        )) : <div className="space-y-4 pt-2">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              setTotalComment={setTotalComment}
            />
          ))}
        </div>
      }

      {isFetchingNextPage && Array(5).fill(5).map((_, index) => (
        <div key={index} className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </InfiniteScroll>
  )
}

function CommentItem({
  comment,
  isReply = false,
  postId,
  setTotalComment
}: CommentItemProps) {
  const { user } = useAuthStore()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(comment?.currentUserReaction ?? null)
  const isCurrentUserComment = user && comment.user.username === user.username
  const router = useRouter()

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: reply_comment,
    onSuccess: () => {
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
      queryClient.setQueryData(['get_comments', variable.postId], (oldData: QueryOldDataCommentsPayload) => {
        return editCommentToPost(oldData, variable.commentId, updatedComment.data)
      })
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: deleteMuFunc } = useMutation({
    mutationFn: delete_comment,
    onSuccess: () =>{
      if(setTotalComment){
        setTotalComment((prev) => prev - 1)
      }
    },
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
    if (editText?.trim()) {
      const payload = {
        content: editText?.trim(),
        commentId: comment.id,
        postId,
        isReply,
      }
      editMnFun(payload)
    }
  }

  const handleDelete = (commentId: number, parentId: number) => {
    const payload = {
      commentId,
      parentId
    }
    deleteMuFunc(payload)
  }

  const handleReaction = (reaction: ReactionType) => {
    setCurrentReaction(reaction)
  }

  return (

    <div className={`flex gap-2 ${isReply ? "ml-8 mt-3" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        { comment?.user?.avatar ? <AvatarImage src={comment?.user?.avatar} alt={comment.user?.full_name} /> : 
        <AvatarFallback>{comment?.user?.full_name?.charAt(0)}</AvatarFallback>}
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex justify-between items-center">
            <CardHoverTooltip user={comment.user}>
              <button onClick={() => router.push(`/${comment?.user?.username}`)} className="font-medium capitalize text-sm cursor-pointer hover:underline">{comment?.user?.full_name}</button>
            </CardHoverTooltip>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt))}</span>
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
            <p className="text-sm mt-1">{parseMentions(comment.content)}</p>
          )}
        </div>

        
        <div className="flex gap-4 mt-1 ml-2 items-center">
          <div className="flex items-center gap-1">
            <CommentReactionPicker isReply={isReply} postId={postId} parentId={comment.parentId} id={comment.id} onReactionSelect={handleReaction} currentReaction={currentReaction} size="sm" />
            <span className="text-xs text-muted-foreground">{comment?.totalReactionsCount}</span>
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
              {user?.avatar ?<AvatarImage
                src={user?.avatar}
                alt={user?.full_name || "You"}
              /> : 
              <AvatarFallback>{user?.full_name?.charAt(0) || "Y"}</AvatarFallback>}
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

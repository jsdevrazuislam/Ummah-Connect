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
import { Badge } from "@/components/ui/badge"
import { ReactionPicker, type ReactionType } from "@/components/reaction-picker"
import { CommentItems, } from "@/components/comment-item"
import { useAuthStore } from "@/store/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookmark_post, delete_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import { create_comment } from "@/lib/apis/comment"
import { SharePostDialog } from "@/components/share-post-dialog"
import EditPostModel from "@/components/edit-post-model"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import { cn } from "@/lib/utils"
import CardHoverTooltip from "./card-hover-tooltip"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { formatDistanceToNowStrict } from "date-fns"
import { SharedPost } from "@/components/share-post"
import { PostMedia } from "@/components/post-media"



interface PostProps {
  post: PostsEntity | undefined;
}

export function Post({ post }: PostProps) {

  if(!post) return

  
  const { user } = useAuthStore()
  const { socket } = useSocketStore()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(post?.currentUserReaction ?? null)
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false)
  const [isEditing, setIsEditing] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCurrentUserPost = user && post?.user?.username === user?.username
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate, isPending: isDeleting } = useMutation({
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
    onSuccess: () => {
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


  const handleDeletePost = () => {
    queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
      const updatedPages = oldData?.pages?.map((page) => {
        const updatedPost = page?.data?.posts?.filter((newPost) => newPost.id !== post.id)
        return {
          ...page,
          data: {
            ...page.data,
            posts: updatedPost
          }
        }
      })

      return {
        ...oldData,
        pages: updatedPages
      }

    })
    mutate(post.id)
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
          { post?.user?.avatar ? <AvatarImage src={post?.user?.avatar} alt={post?.user?.full_name} /> : 
          <AvatarFallback>{post?.user?.full_name?.charAt(0)}</AvatarFallback>}
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <CardHoverTooltip user={post.user}>
                <button onClick={() => router.push(`/profile/${post?.user?.username}`)} className="font-semibold capitalize cursor-pointer hover:underline">{post?.user?.full_name}</button>
              </CardHoverTooltip>
              <span className="text-muted-foreground">
                @{post?.user?.username} · {formatDistanceToNowStrict(new Date(post?.createdAt ?? ''), { addSuffix: true })}
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
                    <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="text-destructive">
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

          {post?.originalPost && post?.content && <p className="mt-4">
            {post.content}
          </p>}
          {
            post?.originalPost ? <SharedPost 
              post={post.originalPost} 
              className="mt-2"
            /> : <div className={cn(`mt-4 text-sm ${post.background && post?.background}`, {'h-56 text-2xl font-semibold flex rounded-md justify-center items-center text-center' : post?.background})}>{post.content}</div>
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


           <PostMedia
              media={post.media} 
              contentType={post.contentType}
              altText={`Post by ${post.user?.full_name}`}
              className="mt-3"
            />

          <div className="mt-4 flex justify-between">
            <div className="flex items-center gap-2">
              <ReactionPicker id={post.id} onReactionSelect={setCurrentReaction} currentReaction={currentReaction} />
              <span className="text-sm text-muted-foreground">{post?.totalReactionsCount}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post?.totalCommentsCount ?? 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => setShowShareDialog(true)}
            >
              <Share className="h-4 w-4" />
              <span>{post?.share}</span>
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
                  { user?.avatar ? <AvatarImage
                    src={user?.avatar}
                    alt={user?.full_name || "Your avatar"}
                  /> : 
                  <AvatarFallback>{user?.full_name?.charAt(0) || "Y"}</AvatarFallback>}
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
              <CommentItems
                postId={post.id}
                totalComment={post?.totalCommentsCount}
              />
            </div>
          )}
        </div>
      </div>
      <EditPostModel post={post} showEditDialog={isEditing} setShowEditDialog={setIsEditing} />
      <SharePostDialog
        post={post}
        postUsername={post?.user?.username}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
       <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete this post?"
        description="This will permanently delete the post"
        type="delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

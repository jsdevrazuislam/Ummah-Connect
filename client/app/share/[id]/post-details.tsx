"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Send,
  MapPin,
  Calendar,
  Share,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ReactionPicker } from "@/components/reaction-picker"
import { useMutation } from "@tanstack/react-query"
import { bookmark_post } from "@/lib/apis/posts"
import { toast } from "sonner"
import { SharePostDialog } from "@/components/share-post-dialog"
import { formatDistanceToNowStrict } from "date-fns"
import EditPostModel from "@/components/edit-post-model"
import { PostMedia } from "@/components/post-media"
import { cn } from "@/lib/utils"
import { SharedPost } from "@/components/share-post"
import { ReportModal } from "@/components/report-modal"
import { useAuthStore } from "@/store/store"
import { CommentItems } from "@/components/comment-item"
import { create_comment } from "@/lib/apis/comment"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"

function PostDetailsPage({ post }: { post: PostsEntity }) {
  const [comment, setComment] = useState("")
  const [showComments, setShowComments] = useState(true)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(post?.currentUserReaction ?? null)
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false)
  const [isEditing, setIsEditing] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false);
  const [totalComment, setTotalComment] = useState(Number(post?.totalCommentsCount) || 0)
  const { user } = useAuthStore()
  const { socket } = useSocketStore()


  const { mutate: bookmarkFunc, isPending } = useMutation({
    mutationFn: bookmark_post,
    onSuccess: () => {
      setIsBookmarked(!isBookmarked)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

   const { mutate: mnFun, isPending: isLoading } = useMutation({
      mutationFn: create_comment,
      onSuccess: () => {
        setTotalComment((prev) => prev + 1)
        setComment("")
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })

  const handleCopyLink = () => {
    const postUrl = `https://ummahconnect.com/post/${post.id}`
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast.success("Link copied to clipboard", {
          description: "You can now share this post with others",
        })
      })
      .catch(() => {
        toast.error("Failed to copy link", {
          description: "Please try again",
        })
      })
  }

  const handleReport = () => {
    setShowReportModal(true)
  }

  const handleAddComment = () => {
    if (comment?.trim()) {
      const payload = {
        content: comment,
        postId: post.id
      }
      mnFun(payload)
    }
  }

  const handleReportSubmit = () => {

  }

  useEffect(() => {
    if (!socket) return;
    socket.emit(SocketEventEnum.JOIN_POST, post.id.toString());
    return () => {
      socket.off(SocketEventEnum.JOIN_POST);
    };
  }, [socket, post]);

  return (
    <>
      <Card className="border-0 shadow-none">
        {/* Post Header */}
        <CardHeader className="p-0 px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                {
                  post?.user?.avatar ? <AvatarImage src={post?.user?.avatar} alt={post?.user?.avatar} /> : <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {post?.user?.full_name?.charAt(2)}
                  </AvatarFallback>
                }
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{post?.user?.full_name}</h3>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{post?.user?.username}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDistanceToNowStrict(new Date(post?.createdAt ?? ''), { addSuffix: true })}</span>
                  </div>
                  {
                    post?.location && <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{post?.location}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>Share post</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport}>Report post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="mt-4">
          <div className="space-y-4">
            {post?.originalPost && post?.content && <p className="ml-2">
              {post.content}
            </p>}
            {
              post?.originalPost ? <SharedPost post={post.originalPost} /> : <div className={cn(`ml-2 -mb-2 text-sm ${post.background && post?.background}`, { 'h-56 text-2xl font-semibold flex rounded-md justify-center items-center text-center': post?.background })}>{post.content}</div>
            }

            <PostMedia
              media={post.media}
              contentType={post.contentType}
              altText={`Post by ${post.user?.full_name}`}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-0">
          <div className="mt-4 flex justify-between w-full">
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
              <span>{totalComment}</span>
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

          <Separator />

          {
            showComments && <div className="w-full space-y-4">
              <h4 className="font-semibold text-foreground">Comments</h4>
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  {
                    user?.avatar ? <AvatarImage src={user?.avatar} alt="You" /> : <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {user?.full_name?.charAt(2)}
                    </AvatarFallback>
                  }

                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleAddComment} disabled={!comment?.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CommentItems
                postId={post.id}
                totalComment={post?.totalCommentsCount}
                setTotalComment={setTotalComment}
              />
            </div>
          }
        </CardFooter>
      </Card>

      <SharePostDialog
        post={post}
        postUsername={post?.user?.username}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
      <EditPostModel post={post} showEditDialog={isEditing} setShowEditDialog={setIsEditing} />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        isLoading={isPending}
      />
    </>
  )
}

export default PostDetailsPage

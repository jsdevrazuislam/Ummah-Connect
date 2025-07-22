"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  MapPin,
  Calendar,
} from "lucide-react"
import { ReactionPicker } from "@/components/reaction-picker"
import { formatDistanceToNowStrict } from "date-fns"
import { PostMedia } from "@/components/post-media"
import { cn } from "@/lib/utils"
import { SharedPost } from "@/components/share-post"
import { CommentItems } from "@/components/comment-item"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import CommentInput from "@/components/comment-input"
import BookmarkButton from "@/components/bookmark-button"
import ShareButton from "@/components/share-button"
import PostDropDownMenu from "@/components/post-menu-dropdown"

function PostDetailsPage({ post }: { post: PostsEntity }) {

  const [showComments, setShowComments] = useState(true)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(post?.currentUserReaction ?? null)
  const [totalComment, setTotalComment] = useState(Number(post?.totalCommentsCount) || 0)
  const { socket } = useSocketStore()



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
            <PostDropDownMenu post={post} />
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
            <ShareButton post={post} />
            <BookmarkButton post={post} />
          </div>

          <Separator />

          {
            showComments && <div className="w-full space-y-4">
              <h4 className="font-semibold text-foreground">Comments</h4>
              <CommentInput setTotalComment={setTotalComment} post={post} />
              <CommentItems
                postId={post.id}
                totalComment={post?.totalCommentsCount}
                setTotalComment={setTotalComment}
              />
            </div>
          }
        </CardFooter>
      </Card>
    </>
  )
}

export default PostDetailsPage

"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  MapPin,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ReactionPicker, type ReactionType } from "@/components/reaction-picker"
import { CommentItems, } from "@/components/comment-item"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import { cn } from "@/lib/utils"
import CardHoverTooltip from "./card-hover-tooltip"
import { useRouter } from "next/navigation"
import { formatDistanceToNowStrict } from "date-fns"
import { SharedPost } from "@/components/share-post"
import { PostMedia } from "@/components/post-media"
import CommentInput from "@/components/comment-input"
import PostDropDownMenu from "@/components/post-menu-dropdown"
import ShareButton from "@/components/share-button"
import BookmarkButton from "@/components/bookmark-button"


interface PostProps {
  post: PostsEntity | undefined;
}

export function Post({ post }: PostProps) {

  if (!post) return


  const { socket } = useSocketStore()
  const [showComments, setShowComments] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(post?.currentUserReaction ?? null)
  const [totalComment, setTotalComment] = useState(Number(post?.totalCommentsCount) || 0)

  const router = useRouter()


  useEffect(() => {
    if (!socket) return;
    socket.emit(SocketEventEnum.JOIN_POST, post.id.toString());
    return () => {
      socket.off(SocketEventEnum.JOIN_POST);
    };
  }, [socket, post]);

  return (
    <div className="border-b border-border px-0 md:px-4 py-4">
      <div className="flex gap-3">
        <Avatar>
          {post?.user?.avatar ? <AvatarImage src={post?.user?.avatar} alt={post?.user?.full_name} /> :
            <AvatarFallback>{post?.user?.full_name?.charAt(0)}</AvatarFallback>}
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <CardHoverTooltip user={post.user}>
                <button onClick={() => router.push(`/${post?.user?.username}`)} className="font-semibold capitalize cursor-pointer hover:underline">{post?.user?.full_name}</button>
              </CardHoverTooltip>
              <span className="text-muted-foreground">
                @{post?.user?.username} · {formatDistanceToNowStrict(new Date(post?.createdAt ?? ''), { addSuffix: true })}
              </span>
            </div>
            <PostDropDownMenu post={post} />
          </div>
        </div>
      </div>


      {post?.originalPost && post?.content && <p className="mt-4 ml-2">
        {post.content}
      </p>}
      {
        post?.originalPost ? <SharedPost
          post={post.originalPost}
          className="mt-2"
        /> : <div className={cn(`mt-4 ml-2 text-sm ${post.background && post?.background}`, { 'h-56 text-2xl font-semibold flex rounded-md justify-center items-center text-center': post?.background })}>{post.content}</div>
      }
      {post?.location && (
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
          <span>{totalComment ?? 0}</span>
        </Button>
        <ShareButton post={post} />
        <BookmarkButton post={post} />
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <h4 className="font-semibold text-foreground">Comments</h4>
          <CommentInput setTotalComment={setTotalComment} post={post} />
          <CommentItems
            postId={post.id}
            totalComment={post?.totalCommentsCount}
            setTotalComment={setTotalComment}
          />
        </div>
      )}
    </div>
  )
}

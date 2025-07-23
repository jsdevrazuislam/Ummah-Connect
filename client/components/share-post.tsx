import { cn } from "@/lib/utils"
import { PostMedia } from "@/components/post-media"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"


export const SharedPost = ({
    post,
    className = ""
}: {
    post: PostsEntity
    className?: string
}) => {
    if (!post) return null

    return (
        <div className={cn("mt-2 border dark:border-gray-500 rounded-lg bg-muted/30", className)}>
            <PostMedia
                media={post?.media}
                contentType={post?.contentType}
                altText={`Shared post by ${post?.user?.full_name}`}
            />

            <div className="px-4 py-2">
                <div className="flex items-center gap-4">
                    <Avatar>
                        {post.user?.avatar ? (
                            <AvatarImage src={post?.user?.avatar} alt={post?.user?.full_name} />
                        ) : (
                            <AvatarFallback>{post?.user?.full_name?.charAt(0)}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <span className="font-semibold capitalize">{post.user?.full_name}</span>{" "}
                        <p className="text-muted-foreground">
                            {formatDistanceToNowStrict(new Date(post?.createdAt ?? ''))}
                        </p>
                    </div>
                </div>
                {post?.content && <p className={cn(`mt-4 ${post.background && post?.background}`, { 'h-56 text-2xl font-semibold flex rounded-md justify-center items-center text-center': post?.background })}>{post?.content}</p>}
                {post?.location && (
                    <div className="mt-2">
                        <Badge variant="outline" className="flex w-fit items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            <span>{post?.location}</span>
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    )
}

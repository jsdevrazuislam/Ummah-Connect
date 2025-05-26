import React, { FC } from 'react'
import { Post } from "@/components/post"
import { PostSkeleton } from "@/components/post-skeleton"
import { InfiniteScroll } from '@/components/infinite-scroll';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface InfiniteScrollPostProps {
    hasMore: boolean
    isLoading: boolean
    onLoadMore: () => void
    loading: boolean
    posts: (PostsEntity | undefined)[]
}

const InfiniteScrollPost: FC<InfiniteScrollPostProps> = ({
    hasMore,
    isLoading,
    onLoadMore,
    loading,
    posts,
}) => {
    return (
        <div>
            <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={onLoadMore}
            >
                <div>
                    {loading ? (
                        Array(10).fill(10).map((_, index) => (
                            <PostSkeleton key={index} />
                        ))
                    ) : (
                        posts?.length > 0 ? posts.map((post) => (
                            <Post key={post?.id} post={post as PostsEntity} />
                        )) : <div className="text-center py-16 border rounded-lg">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h4 className="font-medium mb-2">No posts yet</h4>
                            <p className="text-muted-foreground mb-4">
                                Posts from people you follow will appear here
                            </p>
                            <Button size="sm">Discover People</Button>
                        </div>
                    )}

                    {isLoading && (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    )}

                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>You've reached the end of posts</p>
                        </div>
                    )}
                </div>
            </InfiniteScroll>
        </div>
    )
}

export default InfiniteScrollPost
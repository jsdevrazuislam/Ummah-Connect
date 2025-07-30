import React, { FC } from 'react'
import { Post } from "@/components/post"
import { PostSkeleton } from "@/components/post-skeleton"
import { InfiniteScroll } from '@/components/infinite-scroll';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


interface InfiniteScrollPostProps {
    hasMore: boolean
    isLoading: boolean
    onLoadMore: () => void
    loading: boolean
    posts: (PostsEntity | undefined)[]
    message?:string
    title?:string
}

const InfiniteScrollPost: FC<InfiniteScrollPostProps> = ({
    hasMore,
    isLoading,
    onLoadMore,
    loading,
    posts,
    message = 'Posts from people you follow will appear here',
    title = 'No posts yet'
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
                        posts?.length > 0 ? posts?.map((post) => (
                            <Post key={post?.id} post={post as PostsEntity} />
                        )) : <div className="text-center py-16 border rounded-lg mt-4">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h4 className="font-medium mb-2">{title}</h4>
                            <p className="text-muted-foreground mb-4">
                                {message}
                            </p>
                            <Link href='/discover-people'>
                                <Button size="sm">Discover People</Button>
                            </Link>
                        </div>
                    )}

                    {isLoading && (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    )}
                </div>
            </InfiniteScroll>
        </div>
    )
}

export default InfiniteScrollPost
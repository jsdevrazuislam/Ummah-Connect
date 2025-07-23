"use client"
import { ErrorMessage } from "@/components/api-error"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { Post } from "@/components/post"
import { PostSkeleton } from "@/components/post-skeleton"
import { get_all_bookmark_posts } from "@/lib/apis/posts"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Bookmark } from "lucide-react"

export default function BookmarksPage() {

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<BookmarkPostsResponse>({
        queryKey: ['get_all_bookmark_posts'],
        queryFn: ({ pageParam = 1 }) => get_all_bookmark_posts({ page: Number(pageParam) }),
        getNextPageParam: (lastPage) => {
            const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
            return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });


    const posts = data?.pages.flatMap(page => page?.data?.posts) ?? [];

    const loadMorePosts = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    if (isError) {
        return <div className="flex justify-center items-center mt-10">
            <ErrorMessage type='network' />
        </div>
    }


    return (
        <>
            <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 ">
                <h1 className="text-xl font-bold mb-4">Bookmarks</h1>
            </div>

            <InfiniteScroll
                hasMore={hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={loadMorePosts}
            >
                <div className="">
                    {isLoading ? (
                        Array(10).fill(10).map((_, index) => (
                            <PostSkeleton key={index} />
                        ))
                    ) : (
                        posts?.length > 0 ? posts?.map((post) => (
                            <Post key={post?.id} post={post?.post} />
                        )) : <div className="text-center flex justify-center items-center flex-col py-16  rounded-lg mt-28 ">
                            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                            <h4 className="font-medium mb-2">No bookmarks yet</h4>
                            <p className="text-muted-foreground mb-4">
                                When you bookmark posts, they'll appear here for you to easily find later.
                            </p>
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

        </>
    )
}

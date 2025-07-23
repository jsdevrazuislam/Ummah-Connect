"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { get_all_posts } from "@/lib/apis/posts"
import { RefreshCw } from "lucide-react"
import { useInfiniteQuery } from '@tanstack/react-query';
import FollowingFeed from "@/components/following-feed"
import InfiniteScrollPost from "@/components/infinite-scroll-post"
import { ErrorMessage } from "@/components/api-error"

export function MainFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ['get_all_posts'],
    queryFn: ({ pageParam = 1 }) => get_all_posts({ page: Number(pageParam) }),
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
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Home</h1>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading} className="h-9 w-9">
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <Tabs defaultValue="for-you" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="for-you" className="flex-1">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <InfiniteScrollPost loading={isLoading} hasMore={hasNextPage} isLoading={isFetchingNextPage} onLoadMore={loadMorePosts} posts={posts} />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

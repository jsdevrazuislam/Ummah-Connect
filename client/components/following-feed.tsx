import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

import { ErrorMessage } from "@/components/api-error";
import InfiniteScrollPost from "@/components/infinite-scroll-post";
import { FollowingEmptyState } from "@/components/post-empty-state";
import { getAllFollowingPosts } from "@/lib/apis/posts";

function FollowingFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["get_all_following_posts"],
    queryFn: ({ pageParam = 1 }) => getAllFollowingPosts({ page: Number(pageParam) }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const posts = useMemo(
    () => data?.pages.flatMap(page => page?.data?.posts) ?? [],
    [data],
  );

  const loadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ErrorMessage type="network" />
      </div>
    );
  }

  return (
    <>
      {
        posts?.length > 0 ? <InfiniteScrollPost loading={isLoading} hasMore={hasNextPage} isLoading={isFetchingNextPage} onLoadMore={loadMorePosts} posts={posts} /> : <FollowingEmptyState />
      }
    </>
  );
}

export default FollowingFeed;

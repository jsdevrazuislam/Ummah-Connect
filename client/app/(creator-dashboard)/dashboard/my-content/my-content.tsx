"use client";

import type { SortingState } from "@tanstack/react-table";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { LoadingOverlay } from "@/components/loading-overlay";
import { DataTable } from "@/components/tables/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePost, getMyPosts } from "@/lib/apis/posts";
import { deleteShort, myLives, myShorts } from "@/lib/apis/stream";
import { getLiveColumns, getPostColumns, getShortColumns } from "@/lib/table-columns";
import { showError, showSuccess } from "@/lib/toast";
import { useStore } from "@/store/store";

export default function ContentPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const queryClient = useQueryClient();
  const { user, setUser } = useStore();

  const {
    data: shortsData,
    isLoading: shortsLoading,
    error: shortsError,
  } = useQuery<MyShortsResponse>({
    queryKey: ["my-shorts"],
    queryFn: myShorts,
  });

  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery<MyPostResponse>({
    queryKey: ["my-posts"],
    queryFn: getMyPosts,
  });

  const {
    data: livesData,
    isLoading: livesLoading,
    error: livesError,
  } = useQuery<MyLivesResponse>({
    queryKey: ["my-lives"],
    queryFn: myLives,
  });

  const { mutate: delFunc, isPending: isDeleting } = useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<MyPostResponse>(["my-posts"], (oldData) => {
        if (!oldData)
          return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            posts: oldData.data.posts.filter(post => post.id !== deletedId),
          },
        };
      });
      showSuccess("Post deleted successfully");
      if (user)
        setUser({ ...user, totalPosts: user?.totalPosts - 1 });
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const { isPending, mutate } = useMutation({
    mutationFn: deleteShort,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<MyShortsResponse>(["my-shorts"], (oldData) => {
        if (!oldData)
          return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            shorts: oldData.data.shorts.filter(short => short.id !== deletedId),
          },
        };
      });
      showSuccess("Short deleted successfully");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  return (
    <>
      <LoadingOverlay loading={isPending || isDeleting} />
      <h1 className="text-2xl font-bold mb-6">Your Content</h1>

      <Tabs defaultValue="shorts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="shorts">Shorts</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
        </TabsList>

        <TabsContent value="shorts">
          {shortsError
            ? (
              <div className="text-red-500">
                Error loading shorts:
                {" "}
                {shortsError.message}
              </div>
            )
            : (
              <DataTable
                columns={getShortColumns({
                  onEdit: (id) => {
                    console.log("Edit clicked for:", id);
                    // Open edit modal
                  },
                  onDelete: id => mutate(id),
                  onAnalytics: (id) => {
                    console.log("Analytics clicked for:", id);
                    // Navigate to analytics page
                  },
                })}
                data={shortsData?.data?.shorts || []}
                searchKey="video"
                isLoading={shortsLoading}
                sorting={sorting}
                onSortingChange={setSorting}
              />
            )}
        </TabsContent>

        <TabsContent value="posts">
          {postsError
            ? (
              <div className="text-red-500">
                Error loading posts:
                {" "}
                {postsError.message}
              </div>
            )
            : (
              <DataTable
                columns={getPostColumns({
                  onEdit: (id) => {
                    console.log("Edit clicked for:", id);
                    // Open edit modal
                  },
                  onDelete: id => delFunc(id),
                  onAnalytics: (id) => {
                    console.log("Analytics clicked for:", id);
                    // Navigate to analytics page
                  },
                })}
                data={postsData?.data?.posts || []}
                searchKey="content"
                isLoading={postsLoading}
                sorting={sorting}
                onSortingChange={setSorting}
              />
            )}
        </TabsContent>

        <TabsContent value="live">
          {livesError
            ? (
              <div className="text-red-500">
                Error loading live sessions:
                {" "}
                {livesError.message}
              </div>
            )
            : (
              <DataTable
                columns={getLiveColumns()}
                data={livesData?.data?.lives || []}
                searchKey="title"
                isLoading={livesLoading}
                sorting={sorting}
                onSortingChange={setSorting}
              />
            )}
        </TabsContent>
      </Tabs>
    </>
  );
}

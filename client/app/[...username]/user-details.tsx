"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Grid3X3, Heart, Link2, List, Lock, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import FollowButton from "@/components/follow-button";
import InfiniteScrollPost from "@/components/infinite-scroll-post";
import MessageButton from "@/components/message-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfileDetails } from "@/lib/apis/auth";
import { useStore } from "@/store/store";

export default function ProfilePage({ username, user }: { username: string; user: User }) {
  const { user: currentUser } = useStore();
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["get_user_profile_details"],
    queryFn: ({ pageParam = 1 }) => getUserProfileDetails({ page: Number(pageParam), username }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: currentUser?.id === user?.id ? true : !!(username && !user?.privacySettings?.privateAccount),
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

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const isViewingPrivateProfile = user?.id === currentUser?.id ? false : user?.privacySettings?.privateAccount;

  if (isError) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading posts:
        {error?.message}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <main className="flex-1 border-x border-border">
        <div className="relative">
          <div className="h-72 bg-muted w-full">
            <Image
              src={user?.cover ?? "/placeholder.svg"}
              alt={user?.fullName}
              className="w-full h-full object-cover"
              width={200}
              height={192}
            />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-end gap-4">
                <Avatar className="h-24 w-24 border-4 border-background -mt-12">
                  <Image width={96} height={96} src={user?.avatar ?? "/placeholder.svg"} alt={user?.fullName} />
                </Avatar>

                {user?.privacySettings?.privateAccount && (
                  <Badge variant="secondary" className="flex items-center gap-1 mb-2">
                    <Lock className="h-3 w-3" />
                    Private Account
                  </Badge>
                )}
              </div>

              {currentUser?.id !== user?.id
                ? (
                  <div className="flex gap-2">
                    <FollowButton isFollowing={user?.isFollowing} id={user?.id} />
                    <MessageButton user={{
                      id: user?.id,
                      fullName: user?.fullName,
                      username: user?.username,
                      avatar: user?.avatar ?? "",
                      location: user?.location ?? "",
                      followingCount: user?.followingCount ?? "",
                      followersCount: user?.followersCount ?? "",
                      bio: user?.bio,
                      isFollowing: user?.isFollowing,
                      privacySettings: user?.privacySettings,
                      publicKey: user?.publicKey,
                    }}
                    />
                  </div>
                )
                : <Button onClick={() => router.push("/settings")}>Edit Profile</Button>}
            </div>

            <div className="mt-4">
              <h1 className="text-xl font-bold">{user?.fullName}</h1>
              <p className="text-muted-foreground">
                @
                {user?.username}
              </p>

              <p className="mt-3">{user?.bio}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                {user?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.location}</span>
                  </div>
                )}

                {user?.website && (
                  <div className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    <a href={user?.website} className="text-primary hover:underline">
                      {user?.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined
                    {format(new Date(user?.createdAt), "MMMM yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-sm">
                <div>
                  <span className="font-semibold">{user?.followingCount ?? 0}</span>
                  {" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div>
                  <span className="font-semibold">{user?.followersCount ?? 0}</span>
                  {" "}
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
          </div>

          {isViewingPrivateProfile
            ? (
              <div className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">This Account is Private</h3>
                  <p className="text-muted-foreground mb-4">
                    Follow @
                    {user?.username}
                    {" "}
                    to see their posts and stories.
                  </p>
                </div>
              </div>
            )
            : (
              <Tabs defaultValue="posts" className="mt-4">
                <div className="flex justify-between items-center px-4 border-b">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <TabsContent value="posts" className="mt-0">
                  {viewMode === "list"
                    ? (
                      <InfiniteScrollPost loading={isLoading} hasMore={hasNextPage} isLoading={isFetchingNextPage} onLoadMore={loadMorePosts} posts={posts} />

                    )
                    : (
                      <div className="grid grid-cols-3 gap-1 p-1">
                        {posts?.map(post => (
                          <div
                            key={post?.id}
                            className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
                          >
                            {post?.contentType === "picture"
                              ? (
                                <Image
                                  src={post?.media || "/placeholder.svg"}
                                  alt={post?.content}
                                  className="w-full h-full object-cover"
                                  width={200}
                                  height={200}
                                />
                              )
                              : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                  <p className="text-white text-xs text-center p-2 line-clamp-3">{post?.content}</p>
                                </div>
                              )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="flex items-center gap-4 text-white text-sm">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4 fill-white" />
                                  <span>{post?.totalReactionsCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4 fill-white" />
                                  <span>{post?.totalCommentsCount}</span>
                                </div>
                              </div>
                            </div>

                            {!post?.media && (
                              <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">T</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>
                <TabsContent value="media">
                  {posts?.filter(post => post?.media)?.length === 0
                    ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                        <p className="text-sm font-medium">No media posts yet</p>
                        <p className="text-xs">When you share photos or videos, they’ll appear here.</p>
                      </div>
                    )
                    : (
                      <div className="grid grid-cols-3 gap-1 p-1">
                        {posts
                          ?.filter(post => post?.media)
                          ?.map(post => (
                            <div
                              key={post?.id}
                              className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
                            >
                              {post?.contentType === "picture"
                                ? (
                                  <Image
                                    src={post?.media || "/placeholder.svg"}
                                    alt={post?.content}
                                    className="w-full h-full object-cover"
                                    width={200}
                                    height={200}
                                  />
                                )
                                : (
                                  <Image
                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/w_300,h_200,c_thumb,q_auto,f_jpg/${post?.media}.png`}
                                    alt={post?.content ?? ""}
                                    className="w-full h-full object-cover"
                                    width={200}
                                    height={200}
                                  />
                                )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <div className="flex items-center gap-4 text-white text-sm">
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-4 w-4 fill-white" />
                                    <span>{post?.totalReactionsCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4 fill-white" />
                                    <span>{post?.totalCommentsCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                </TabsContent>

              </Tabs>
            )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Link2, Lock, Share, User, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sharePost } from "@/lib/apis/posts";
import { showError, showSuccess } from "@/lib/toast";
import { useStore } from "@/store/store";

type SharePostDialogProps = {
  post: PostsEntity;
  postUsername: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SharePostDialog({
  post,
  postUsername,
  open,
  onOpenChange,
}: SharePostDialogProps) {
  const [additionalText, setAdditionalText] = useState("");
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState<"public" | "friends" | "private" | "only me">("public");
  const { user, setUser } = useStore();

  const { mutate, isPending } = useMutation({
    mutationFn: sharePost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["get_all_posts"] });

      const previousPosts = queryClient.getQueryData(["get_all_posts"]);

      if (previousPosts) {
        queryClient.setQueryData(["get_all_posts"], (oldData: QueryOldDataPayload) => {
          if (!oldData?.pages)
            return oldData;

          const updatedPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              const updatedPosts = page?.data?.posts?.map((p) => {
                if (newPost.postId === p.id
                  || (p.originalPost && newPost.postId === p.originalPost.id)) {
                  return { ...p, share: p.share + 1 };
                }
                return p;
              });

              return {
                ...page,
                data: {
                  ...page.data,
                  posts: [
                    ...(updatedPosts ?? []),
                  ],
                },
              };
            }
            return page;
          });

          return { ...oldData, pages: updatedPages };
        });
      }

      return { previousPosts };
    },
    onSuccess: (data, variables) => {
      if (data?.data?.postData && data.data.postData.privacy === "public") {
        queryClient.setQueryData(["get_all_posts"], (oldData: QueryOldDataPayload) => {
          if (!oldData?.pages)
            return oldData;
          const updatedPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              const updatedPosts = page?.data?.posts?.map((p) => {
                if (variables.postId === p.id
                  || (p.originalPost && variables.postId === p.originalPost.id)) {
                  return { ...p, share: data?.data?.postData?.share ?? p.share + 1 };
                }
                return p;
              });

              return {
                ...page,
                data: {
                  ...page.data,
                  posts: [
                    data?.data?.postData,
                    ...(updatedPosts ?? []),
                  ],
                },
              };
            }
            return page;
          });

          return { ...oldData, pages: updatedPages };
        });
      }

      queryClient.setQueryData(
        ["get_post", variables.postId],
        (oldPost: PostsEntity) => oldPost ? { ...oldPost, share: oldPost.share + 1 } : oldPost,
      );

      if (user)
        setUser({ ...user, totalPosts: user.totalPosts + 1 });
      setAdditionalText("");
      onOpenChange(false);

      queryClient.invalidateQueries({ queryKey: ["get_all_posts"] });
      queryClient.invalidateQueries({ queryKey: ["get_post", variables.postId] });
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleCopyLink = () => {
    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}share/${post.id}`;
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        showSuccess("Link copied to clipboard. You can now share this post with others");
      })
      .catch(() => {
        showError("Failed to copy link", {
          description: "Please try again",
        });
      });
  };

  const handleShareToFeed = () => {
    const payload = {
      postId: post?.originalPost?.id ? post?.originalPost?.id : post.id,
      message: additionalText,
      visibility,
    };
    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>Share this post with your friends and followers</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input value={`${process.env.NEXT_PUBLIC_SITE_URL}share/${post.id}`} readOnly className="flex-1" />
            <Button onClick={handleCopyLink}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>

          <div className="border border-border rounded-md p-3">
            <p className="text-sm text-muted-foreground mb-2">Add your thoughts</p>
            <Textarea
              placeholder="What's on your mind?"
              value={additionalText}
              onChange={e => setAdditionalText(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <div className="flex justify-between items-center mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    {visibility === "public" && <Globe className="h-4 w-4" />}
                    {visibility === "friends" && <Users className="h-4 w-4" />}
                    {visibility === "private" && <Lock className="h-4 w-4" />}
                    {visibility === "only me" && <User className="h-4 w-4" />}
                    <span>
                      {visibility === "public"
                        ? "Public"
                        : visibility === "friends"
                          ? "Friends"
                          : visibility === "private"
                            ? "Private"
                            : "Only me"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setVisibility("public")} className="gap-2">
                    <Globe className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">Anyone can see this post</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisibility("friends")} className="gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Friends</p>
                      <p className="text-xs text-muted-foreground">Only your friends can see this post</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisibility("private")} className="gap-2">
                    <Lock className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-xs text-muted-foreground">Only you and mentioned users can see this post</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisibility("only me")} className="gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Only me</p>
                      <p className="text-xs text-muted-foreground">Only you can see this post</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-muted-foreground">
                Sharing @
                {postUsername}
                's post
              </p>
            </div>
          </div>

          <Button variant="outline" className="flex-1 gap-2" onClick={handleShareToFeed} disabled={isPending}>
            <Share className="h-4 w-4" />
            Share to Feed
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

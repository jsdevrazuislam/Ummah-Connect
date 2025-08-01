import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Flag,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import React, { useState } from "react";

import { ConfirmationModal } from "@/components/confirmation-modal";
import EditPostModel from "@/components/edit-post-model";
import { ReportModal } from "@/components/report-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePost } from "@/lib/apis/posts";
import { showError } from "@/lib/toast";
import { useStore } from "@/store/store";

function PostDropDownMenu({ post }: { post: PostsEntity }) {
  const { user, setUser } = useStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const isCurrentUserPost = user && post?.user?.username === user?.username;

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      if (user)
        setUser({ ...user, totalPosts: user?.totalPosts - 1 });
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleDeletePost = () => {
    queryClient.setQueryData(["get_all_posts"], (oldData: QueryOldDataPayload) => {
      const updatedPages = oldData?.pages?.map((page) => {
        const updatedPost = page?.data?.posts?.filter(newPost => newPost.id !== post.id);
        return {
          ...page,
          data: {
            ...page.data,
            posts: updatedPost,
          },
        };
      });

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
    mutate(post.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCurrentUserPost
            ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2" onClick={() => setIsEditing(true)}>
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">Edit</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Modify the details of this post.
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2" onClick={() => setIsModalOpen(true)}>
                    <div className="flex items-center gap-2">
                      <Trash className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-sm">Delete</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Permanently remove this post.
                    </p>
                  </DropdownMenuItem>
                </>
              )
            : (
                <>
                  <DropdownMenuItem onClick={() => setShowReportModal(!showReportModal)} className="flex flex-col items-start gap-1 py-2">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm">Report</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Report this profile for inappropriate content.
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-sm">Block Profile</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Prevent this user from contacting you.
                    </p>
                  </DropdownMenuItem>
                </>
              )}
        </DropdownMenuContent>
      </DropdownMenu>
      <EditPostModel post={post} showEditDialog={isEditing} setShowEditDialog={setIsEditing} />
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete this post?"
        description="This will permanently delete the post"
        type="delete"
        isLoading={isDeleting}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        id={1}
      />
    </>
  );
}

export default PostDropDownMenu;

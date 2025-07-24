import React, { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    MoreHorizontal,
    Pencil,
    Trash,
    Flag,
    Ban,
} from "lucide-react"
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/store'
import EditPostModel from '@/components/edit-post-model'
import { ConfirmationModal } from '@/components/confirmation-modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { delete_post } from '@/lib/apis/posts'
import { toast } from 'sonner'
import { ReportModal } from '@/components/report-modal'


const PostDropDownMenu = ({ post }: { post: PostsEntity }) => {

    const { user, setUser } = useStore()
    const [showReportModal, setShowReportModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const queryClient = useQueryClient()
    const isCurrentUserPost = user && post?.user?.username === user?.username


    const { mutate, isPending: isDeleting } = useMutation({
        mutationFn: delete_post,
        onSuccess: () => {
            if (user) setUser({ ...user, totalPosts: user?.totalPosts - 1 })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })


    const handleDeletePost = () => {
        queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
            const updatedPages = oldData?.pages?.map((page) => {
                const updatedPost = page?.data?.posts?.filter((newPost) => newPost.id !== post.id)
                return {
                    ...page,
                    data: {
                        ...page.data,
                        posts: updatedPost
                    }
                }
            })

            return {
                ...oldData,
                pages: updatedPages
            }

        })
        mutate(post.id)
    }


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
                    {isCurrentUserPost && (
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
    )
}

export default PostDropDownMenu
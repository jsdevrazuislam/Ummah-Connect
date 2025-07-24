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
    Sparkles,
    Pencil,
    Trash,
    FlagOff,
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
    const [showTranslation, setShowTranslation] = useState(false)
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


    const handleReportSubmit = () =>{}
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
                    <DropdownMenuItem onClick={() => setShowTranslation(!showTranslation)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {showTranslation ? "Hide translation" : "Translate post"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowReportModal(!showReportModal)}>
                        <FlagOff className="h-4 w-4 mr-2" />
                        Report
                    </DropdownMenuItem>

                    {isCurrentUserPost && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="text-destructive">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete post
                            </DropdownMenuItem>
                        </>
                    )}

                    {!isCurrentUserPost && (
                        <DropdownMenuItem>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Not interested
                        </DropdownMenuItem>
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
        onSubmit={handleReportSubmit}
        isLoading={false}
      />
        </>
    )
}

export default PostDropDownMenu
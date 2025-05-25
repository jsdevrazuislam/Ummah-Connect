import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Globe, ImageIcon, Lock, MapPin, Pencil, User, Users, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { delete_post_media, edit_post } from '@/lib/apis/posts'
import { toast } from 'sonner'
import LoadingUi from '@/components/ui-loading'

interface EditPostModelProps {
    post: PostsEntity
    showEditDialog: boolean
    setShowEditDialog: (open: boolean) => void
}

const EditPostModel = ({
    post,
    showEditDialog,
    setShowEditDialog
}: EditPostModelProps) => {

    const [editText, setEditText] = useState(post.content)
    const [selectedImage, setSelectedImage] = useState(post.image)
    const [newImage, setNewImage] = useState<File | undefined>()
    const [selectedLocation, setSelectedLocation] = useState(post.location)
    const [mode, setMode] = useState(post.privacy)
    const queryClient = useQueryClient()

    const { mutate: deleteFun, isPending: deleteLoading } = useMutation({
        mutationFn: delete_post_media,
        onSuccess: () => {
            setSelectedImage('')
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: ({ postId, payload }: { postId: number; payload: FormData }) => edit_post(postId, payload),
        onSuccess: (updatePost, variable) => {
            queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
                const updatedPages = oldData?.pages?.map((page) => {

                    const updatedPost = page?.data?.posts?.map((post) => {

                        if (post.id === variable.postId) {

                            return {
                                ...post,
                                content: updatePost.data.content,
                                location: updatePost.data.location,
                                image: updatePost.data.media,
                                privacy: updatePost.data.privacy
                            }
                        }

                        return post
                    })

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
            setShowEditDialog(false)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const handleEdit = () => {
        const formData = new FormData()
        formData.append("content", editText)
        if (selectedLocation) {
            formData.append("location", selectedLocation)
        }
        if (newImage) {
            formData.append("media", newImage)
        }
        formData.append("privacy", mode)
        mutate({ postId: post.id, payload: formData })
    }

    return (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>

            <DialogContent className={`sm:max-w-[500px] max-h-[80vh] ${isPending ? ' overflow-hidden' : 'overflow-scroll'}`}>
                {
                    isPending && <LoadingUi title='Updating Post' />
                }
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="What's on your mind?"
                        className="min-h-[100px]"
                    />

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Post Image</h3>

                        {selectedImage ? (
                            <div className="relative rounded-lg overflow-hidden border border-border">
                                {deleteLoading && <LoadingUi title='Delete image' />}
                                <img
                                    src={selectedImage || "/placeholder.svg"}
                                    alt="Post image"
                                    className="w-full h-auto max-h-[200px] object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                                        onClick={() => {
                                            document.getElementById("edit-image-upload")?.click()
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                                        onClick={() => {
                                            deleteFun(post.id)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-20 border-dashed flex flex-col gap-1"
                                onClick={() => {
                                    document.getElementById("edit-image-upload")?.click()
                                }}
                            >
                                <ImageIcon className="h-5 w-5" />
                                <span className="text-xs">Upload Image</span>
                            </Button>
                        )}

                        <Input
                            type="file"
                            id="edit-image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const imageUrl = URL.createObjectURL(file)
                                    setSelectedImage(imageUrl)
                                    setNewImage(file)
                                }
                            }}
                        />
                    </div>

                    {selectedLocation && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Location</h3>
                            <Badge variant="outline" className="flex w-fit gap-1 text-xs">
                                <MapPin className="h-3 w-3" />
                                <span>
                                    {selectedLocation}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedLocation('')
                                    }}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Who can see your post?</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 w-full justify-start">
                                    {mode === "public" && <Globe className="h-4 w-4" />}
                                    {mode === "friends" && <Users className="h-4 w-4" />}
                                    {mode === "private" && <Lock className="h-4 w-4" />}
                                    {mode === "only_me" && <User className="h-4 w-4" />}
                                    <span>
                                        {mode === "public"
                                            ? "Public"
                                            : mode === "friends"
                                                ? "Friends"
                                                : mode === "private"
                                                    ? "Private"
                                                    : "Only me"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px]">
                                <DropdownMenuItem
                                    onClick={() => setMode('public')}
                                    className="gap-2"
                                >
                                    <Globe className="h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Public</p>
                                        <p className="text-xs text-muted-foreground">Anyone can see this post</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setMode('friends')}
                                    className="gap-2"
                                >
                                    <Users className="h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Friends</p>
                                        <p className="text-xs text-muted-foreground">Only your friends can see this post</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setMode('private')}
                                    className="gap-2"
                                >
                                    <Lock className="h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Private</p>
                                        <p className="text-xs text-muted-foreground">Only you and mentioned users can see this post</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setMode('only_me')}
                                    className="gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Only me</p>
                                        <p className="text-xs text-muted-foreground">Only you can see this post</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEdit}
                        disabled={!editText?.trim() || isPending}
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EditPostModel
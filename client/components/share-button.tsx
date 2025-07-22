import React, { useState } from 'react'
import {
    Share,
} from "lucide-react"
import { Button } from '@/components/ui/button'
import { SharePostDialog } from '@/components/share-post-dialog'

const ShareButton = ({ post }: { post: PostsEntity }) => {
    const [showShareDialog, setShowShareDialog] = useState(false)
    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1"
                onClick={() => setShowShareDialog(true)}
            >
                <Share className="h-4 w-4" />
                <span>{post?.share}</span>
            </Button>

            <SharePostDialog
                post={post}
                postUsername={post?.user?.username}
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
            />
        </>
    )
}

export default ShareButton
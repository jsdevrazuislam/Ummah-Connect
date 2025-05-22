"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link2, Share, MessageCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Lock, Users, User } from "lucide-react"

interface SharePostDialogProps {
  postId: number
  postContent: string
  postUsername: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare: (postId: number, shareType: "feed" | "message", additionalText?: string) => void
}

export function SharePostDialog({
  postId,
  postContent,
  postUsername,
  open,
  onOpenChange,
  onShare,
}: SharePostDialogProps) {
  const [additionalText, setAdditionalText] = useState("")
  const [visibility, setVisibility] = useState<"public" | "friends" | "private" | "only_me">("public")
  const [isSharing, setIsSharing] = useState(false)

  const handleCopyLink = () => {
    const postUrl = `https://ummahconnect.com/post/${postId}`
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast({
          title: "Link copied to clipboard",
          description: "You can now share this post with others",
        })
      })
      .catch(() => {
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        })
      })
  }

  const handleShareToFeed = () => {
    setIsSharing(true)

    // Simulate API call
    setTimeout(() => {
      onShare(postId, "feed", additionalText)
      setAdditionalText("")
      setIsSharing(false)
      onOpenChange(false)

      toast({
        title: "Post shared to your feed",
        description: "Your followers will now see this post",
      })
    }, 1000)
  }

  const handleShareToMessage = () => {
    setIsSharing(true)

    // Simulate API call
    setTimeout(() => {
      onShare(postId, "message", additionalText)
      setAdditionalText("")
      setIsSharing(false)
      onOpenChange(false)

      toast({
        title: "Post shared via message",
        description: "You can select recipients in the messages tab",
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>Share this post with your friends and followers</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input value={`https://ummahconnect.com/post/${postId}`} readOnly className="flex-1" />
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
              onChange={(e) => setAdditionalText(e.target.value)}
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
                    {visibility === "only_me" && <User className="h-4 w-4" />}
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
                  <DropdownMenuItem onClick={() => setVisibility("only_me")} className="gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Only me</p>
                      <p className="text-xs text-muted-foreground">Only you can see this post</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-muted-foreground">Sharing @{postUsername}'s post</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleShareToFeed} disabled={isSharing}>
              <Share className="h-4 w-4" />
              Share to Feed
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={handleShareToMessage} disabled={isSharing}>
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSharing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

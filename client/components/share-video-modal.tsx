"use client";

import { Copy, Facebook, Globe, Lock, MessageCircle, Share, Twitter, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/lib/toast";

type ShareVideoDialogProps = {
  videoId: number;
  videoTitle: string;
  username: string;
  userAvatar?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareVideoDialog({
  videoId,
  videoTitle,
  username,
  userAvatar,
  open,
  onOpenChange,
}: ShareVideoDialogProps) {
  const [shareText, setShareText] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Link copied!. Video link has been copied to clipboard");
    }
    catch {
      showError("Failed to copy", {
        description: "Please try again",
      });
    }
  };

  const handleShareToFeed = async () => {
    setIsSharing(true);

    setTimeout(() => {
      showSuccess("Shared to your feed!. Your followers can now see this video");
      setIsSharing(false);
      onOpenChange(false);
      setShareText("");
    }, 1500);
  };

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(`Check out this amazing video by @${username}: ${videoTitle}`);
    const url = encodeURIComponent(shareUrl);

    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
      showSuccess(`Opening share dialog... Sharing to ${platform}`);
    }
  };

  useEffect(() => {
    setShareUrl(`${process.env.NEXT_PUBLIC_SITE_URL}${videoId}`);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
          <DialogDescription>Share this amazing video with your friends and followers</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-3 bg-muted w-fit rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar || "/placeholder.svg"} alt={username} />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                @
                {username}
              </p>
              <p className="text-xs text-muted-foreground">{videoTitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Quick Share</h4>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={handleShareToFeed}
              disabled={isSharing}
            >
              <Share className="h-4 w-4" />
              Share to Feed
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Share to Social Media</h4>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleSocialShare("facebook")} className="h-12 w-12">
                <Facebook className="h-5 w-5 text-blue-600" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleSocialShare("twitter")} className="h-12 w-12">
                <Twitter className="h-5 w-5 text-blue-400" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleSocialShare("whatsapp")} className="h-12 w-12">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleSocialShare("telegram")} className="h-12 w-12">
                <Share className="h-5 w-5 text-blue-500" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Copy Link & Download */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">More Options</h4>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button onClick={handleCopyLink} size="sm">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Share with Custom Message */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add Your Thoughts</h4>
            <Textarea
              placeholder="What do you think about this video?"
              value={shareText}
              onChange={e => setShareText(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    {visibility === "public" && <Globe className="h-4 w-4" />}
                    {visibility === "friends" && <Users className="h-4 w-4" />}
                    {visibility === "private" && <Lock className="h-4 w-4" />}
                    <span className="capitalize">{visibility}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setVisibility("public")} className="gap-2">
                    <Globe className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">Anyone can see</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisibility("friends")} className="gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Friends</p>
                      <p className="text-xs text-muted-foreground">Only friends can see</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVisibility("private")} className="gap-2">
                    <Lock className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-xs text-muted-foreground">Only you can see</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleShareToFeed} disabled={isSharing} size="sm">
                {isSharing ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

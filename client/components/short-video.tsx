"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  PauseIcon,
  PlayIcon,
  Share,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { VideoPlayerHandle } from "@/app/(dashboard)/shorts/[id]/player";

import VideoPlayer from "@/app/(dashboard)/shorts/[id]/player";
import ShortsControls from "@/app/(dashboard)/shorts/[id]/shorts-controls";
import FollowButton from "@/components/follow-button";
import { ShareVideoDialog } from "@/components/share-video-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { createComment } from "@/lib/apis/comment";
import { reactPost } from "@/lib/apis/posts";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";

type VideoShortsProps = {
  currentShort: ShortsEntity | null | undefined;
  isActive: boolean;
};

export default function ShortVideo({ currentShort, isActive }: VideoShortsProps) {
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLParagraphElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);
  const [overlayIconType, setOverlayIconType] = useState<"play" | "pause" | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useStore();

  const { mutate } = useMutation({
    mutationFn: reactPost,
    onSuccess: (updateData) => {
      console.log(updateData);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const { mutate: mnFun, isPending } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setCommentText("");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSliderChange = (value: number[]) => {
    setCurrentTime(value[0]);
    setIsSeeking(true);
  };

  const handleSliderCommit = (value: number[]) => {
    playerRef.current?.seekTo(value[0]);
    setIsSeeking(false);
  };

  useEffect(() => {
    if (titleTextRef.current && titleContainerRef.current) {
      const isOverflowing
                = titleTextRef.current.scrollHeight > titleContainerRef.current.clientHeight
                  || titleTextRef.current.scrollWidth > titleContainerRef.current.clientWidth;
      setIsOverflowing(isOverflowing);
    }
  }, [expanded, currentShort?.description]);

  const handlePlayPauseClick = () => {
    const player = playerRef.current;
    if (player) {
      if (player.isPlaying()) {
        player.pause();
        setOverlayIconType("pause");
      }
      else {
        player.play();
        setOverlayIconType("play");
      }
      setShowPlayPauseOverlay(true);
      setTimeout(() => {
        setShowPlayPauseOverlay(false);
      }, 500);
    }
  };

  const handleLike = () => {
    const payload = {
      reactType: "love",
      icon: "❤️",
      id: currentShort?.id ?? 0,
      type: "short",
    };
    mutate(payload);
    setLiked(true);
  };

  const handleMute = () => {
    mnFun({
      postId: currentShort?.id ?? 0,
      content: commentText,
      type: "short",
    });
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  useEffect(() => {
    if (playerRef.current) {
      if (isActive && isPlaying) {
        playerRef.current.play();
      }
      else {
        playerRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    }
    else {
      setIsPlaying(false);
    }
  }, [isActive]);

  if (!currentShort)
    return;

  return (

    <div className="relative h-full w-full max-w-[350px] mx-auto snap-start">
      <div className="relative bg-black rounded-lg h-[calc(100vh-90px)] overflow-hidden">
        <VideoPlayer
          ref={playerRef}
          autoPlay={isActive}
          muted={isMuted}
          onLoadedMetadata={dur => setDuration(dur)}
          onTimeUpdate={(time) => {
            if (!isSeeking)
              setCurrentTime(time);
            if (playerRef.current?.isPlaying())
              setIsPlaying(true);
            else setIsPlaying(false);
          }}
          videoUrl={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/sp_auto/v1751778607/${currentShort?.videoId}.m3u8`}
        />

        <div className="absolute inset-0 z-10" onClick={handlePlayPauseClick}>
          <AnimatePresence>
            {showPlayPauseOverlay && (
              <motion.div
                key="overlay"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="h-20 w-20 rounded-full drop-shadow-lg bg-black/70 flex justify-center items-center">
                  {overlayIconType === "play" && <PlayIcon className="text-white w-8 h-8" />}
                  {overlayIconType === "pause" && <PauseIcon className="text-white w-8 h-8" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute z-30 bottom-8 left-4 right-16">
          <Link href={`/profile/${currentShort?.user?.username}`} className="flex items-center space-x-2 mb-2 cursor-pointer">
            <Avatar className="h-8 w-8">
              {currentShort?.user?.avatar && <AvatarImage src={currentShort?.user?.avatar} />}
              {!currentShort?.user?.avatar && <AvatarFallback>{currentShort?.user?.fullName?.charAt(0)}</AvatarFallback>}
            </Avatar>
            <div>
              <p className="font-semibold text-white">{currentShort?.user?.fullName}</p>
              <FollowButton iconClassName="w-2 h-2" className="text-xs h-6 w-18 gap-1" isFollowing={currentShort?.isFollowing} id={currentShort.userId} />
            </div>
          </Link>

          <div className="relative">
            <div
              ref={titleContainerRef}
              className={`text-white text-sm mb-1 pr-2 ${expanded ? "max-h-[80px] overflow-y-auto" : "max-h-[40px] overflow-hidden"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#ffffff30 transparent",
              }}
            >
              <p className="short_description" ref={titleTextRef}>{currentShort?.description}</p>
            </div>

            {isOverflowing && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-white text-xs font-medium hover:underline focus:outline-none mt-1"
              >
                {expanded ? "Show Less" : "See More"}
              </button>
            )}
          </div>

        </div>

        <ShortsControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          onPlayPause={() => {
            const player = playerRef.current;
            if (player?.isPlaying())
              player.pause();
            else player?.play();
          }}
          onMuteUnmute={() => {
            setIsMuted(prev => !prev);
            playerRef.current?.toggleMute();
          }}
          shortId={currentShort?.id}
        />

        <div className="absolute bottom-3 left-0 right-0 px-4">
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={[currentTime]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            className="flex-1"
            trackClassName="h-1"
            thumbClassName="hidden"
            rangeClassName="!bg-primary"
          />
        </div>

        {showComments && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Comments 40</h3>
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowComments(false)}>
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {
                [...Array.from({ length: 100 })].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">user123</span>
                        <span className="text-white/50 text-xs">2h ago</span>
                      </div>
                      <p className="text-white text-sm mt-1">MashaAllah, beautiful architecture!</p>
                    </div>
                  </div>
                ))
              }

            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  { user?.avatar
                    ? <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    : <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>}
                </Avatar>
                <Input
                  placeholder="Add a comment..."
                  className="bg-white/10 border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <Button disabled={isPending} onClick={handleMute} size="sm">Post</Button>
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-20 right-2 z-10 flex justify-end items-end">
          <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-col gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/40"
                onClick={handleLike}
              >
                <Heart className={cn("h-6 w-6", liked ? "fill-red-500 text-red-500" : "")} />
              </Button>
              <span className="text-white text-xs">{currentShort?.totalReactionsCount}</span>
            </div>

            <div className="flex flex-col gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/40"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              <span className="text-white text-xs">{currentShort?.totalCommentsCount}</span>
            </div>

            <div className="flex flex-col gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/40"
                onClick={handleShare}
              >
                <Share className="h-6 w-6" />
              </Button>
              <span className="text-white text-xs">{currentShort?.share}</span>
            </div>
          </div>

        </div>
      </div>

      <ShareVideoDialog
        videoId={currentShort?.id}
        videoTitle={currentShort?.description}
        username={currentShort?.user.username}
        userAvatar={currentShort?.user.avatar}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </div>
  );
}

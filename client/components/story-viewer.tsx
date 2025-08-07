"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Flag, Heart, MoreVertical, Send, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { ReportModal } from "@/components/report-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { deleteStory } from "@/lib/apis/stream";
import { showError } from "@/lib/toast";
import { useStore } from "@/store/store";

type StoryViewerProps = {
  story: StoryEntity;
  onClose: () => void;
};

export function StoryViewer({ story, onClose }: StoryViewerProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user, deleteStoryFromStore } = useStore();

  const storyDuration = 5000;

  const goToNextItem = useCallback(() => {
    if (currentItemIndex < story?.stories?.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setProgress(0);
    }
    else {
      onClose();
    }
  }, [currentItemIndex, story?.stories?.length, onClose]);

  const { mutate: muFun } = useMutation({
    mutationFn: deleteStory,
    onError: (error) => {
      showError(error.message);
    },
  });

  const goToPrevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      setProgress(0);
    }
  };

  const handleDeleteStory = (id: number) => {
    muFun(id);
    deleteStoryFromStore(id);
    onClose();
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (isPaused)
      return;

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / storyDuration) * 100;
        if (newProgress >= 100) {
          clearInterval(interval);
          goToNextItem();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentItemIndex, isPaused, goToNextItem]);

  const handleTouchStart = () => {
    setIsPaused(true);
  };
  const handleStory = (index: number) => {
    setCurrentItemIndex(index);
    setProgress(0);
  };
  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const currentItem = story?.stories[currentItemIndex];

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (!currentItem)
    return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div
        className="relative w-full h-full max-w-md mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        <div className="relative h-full w-full bg-black">
          {currentItem.type === "image" && currentItem.mediaUrl && (
            <div className="w-full h-full">
              {currentItem?.caption && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 max-w-full border border-white/20">
                    <p
                      className="text-center text-2xl font-semibold break-words leading-relaxed"
                      style={{ color: currentItem.textColor }}
                    >
                      {currentItem.caption}
                    </p>
                  </div>
                </div>
              )}
              <Image src={currentItem.mediaUrl} width={200} height={150} alt="Story" className="h-full w-full object-contain" />

            </div>
          )}
          {currentItem.type === "text" && (
            <div className="h-full w-full flex items-center justify-center p-8" style={{ background: currentItem?.background }}>
              <p className="text-2xl text-center font-medium" style={{ color: currentItem.textColor }}>{currentItem.caption}</p>
            </div>
          )}
        </div>

        <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-[100]">
          {story?.stories?.map((_, index) => (
            <div
              key={index}
              className="h-1 bg-white/30 rounded-full flex-1 cursor-pointer"
              onClick={() => handleStory(index)}
            >
              {index === currentItemIndex
                ? (
                    <Progress value={progress} className="h-full" />
                  )
                : index < currentItemIndex
                  ? (
                      <div className="h-full bg-white rounded-full w-full" />
                    )
                  : null}
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {story?.avatar
                ? <AvatarImage src={story?.avatar} alt={story?.fullName} />
                : <AvatarFallback>{story?.fullName?.charAt(0)}</AvatarFallback>}
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{story?.fullName}</p>
              <p className="text-white/70 text-xs">{formatTimestamp(currentItem?.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-50">
            <DropdownMenu onOpenChange={(open) => {
              setIsPaused(open);
            }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="text-white bg-transparent w-6 h-6 hover:bg-white/10 cursor-pointer"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {story.id === user?.id && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="default"
              size="icon"
              onClick={onClose}
              className="text-white bg-transparent w-6 h-6 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {story?.stories.length > 1 && (
          <>
            <button
              className={`absolute top-1/2 left-2 transform -translate-y-1/2 w-fit flex items-center justify-start z-10 ${
                currentItemIndex === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                goToPrevItem();
              }}
              disabled={currentItemIndex === 0}
            >
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <ChevronLeft className="h-6 w-6 text-black" />
              </div>
            </button>

            <button
              className={`absolute top-1/2 right-2 transform -translate-y-1/2 w-fit flex items-center justify-end z-10 ${
                currentItemIndex === story.stories.length - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                goToNextItem();
              }}
              disabled={currentItemIndex === story.stories.length - 1}
            >
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <ChevronRight className="h-6 w-6 text-black" />
              </div>
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-0 right-0 p-4 flex items-center gap-4 z-10">
          <input
            type="text"
            placeholder="Reply..."
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2 text-sm border-none focus:outline-none"
          />
          <Button variant="ghost" size="icon" className="text-white">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteStory(currentItem.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        id={3}
      />
    </div>
  );
}

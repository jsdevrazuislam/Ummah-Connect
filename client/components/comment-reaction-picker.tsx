"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { commentReact } from "@/lib/apis/comment";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";

type CommentReactionPickerProps = {
  onReactionSelect: (reaction: ReactionType) => void;
  currentReaction: ReactionType;
  size?: "sm" | "default";
  id: number;
  parentId: number;
  postId: number;
  isReply?: boolean;
};

export function CommentReactionPicker({
  onReactionSelect,
  currentReaction,
  size = "default",
  id,
  postId,
  isReply,
  parentId,
}: CommentReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { mutate } = useMutation({
    mutationFn: commentReact,
    onError: (error) => {
      showError(error.message);
    },
  });

  const reactions = [
    { type: "like", emoji: "/emoji/like.png", label: "Like" },
    { type: "love", emoji: "/emoji/love.png", label: "Love" },
    { type: "haha", emoji: "/emoji/haha.png", label: "Haha" },
    { type: "care", emoji: "/emoji/care.png", label: "Care" },
    { type: "sad", emoji: "/emoji/sad.png", label: "Sad" },
    { type: "wow", emoji: "/emoji/wow.png", label: "Wow" },
    { type: "angry", emoji: "/emoji/angry.png", label: "Angry" },
  ] as const;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleReactionClick = (reaction: ReactionType) => {
    if (reaction === currentReaction) {
      onReactionSelect(null);
    }
    else {
      onReactionSelect(reaction);
    }
    const payload = {
      reactType: reaction ?? "",
      icon: reactions.find(r => r.type === reaction)?.emoji ?? "",
      id,
      postId,
      parentId,
      isReply,
    };
    mutate(payload);
    setIsOpen(false);
  };

  const handleMainButtonClick = () => {
    if (currentReaction) {
      handleReactionClick(currentReaction);
    }
    else {
      handleReactionClick("like");
    }
  };

  const getCurrentReactionEmoji = () => {
    if (!currentReaction)
      return null;
    const reaction = reactions.find(r => r.type === currentReaction);
    return reaction?.emoji;
  };

  const getCurrentReactionColor = () => {
    switch (currentReaction) {
      case "like":
        return "text-blue-500";
      case "love":
        return "text-red-500";
      case "haha":
        return "text-yellow-500";
      case "care":
        return "text-orange-500";
      case "sad":
        return "text-purple-500";
      case "wow":
        return "text-yellow-500";
      case "angry":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className="relative -mt-[2px]"
      ref={pickerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "text-muted-foreground p-0 h-auto",
          size === "sm" ? "text-xs" : "text-sm",
          currentReaction && getCurrentReactionColor(),
        )}
        onMouseEnter={() => setIsOpen(true)}
        onClick={handleMainButtonClick}
      >
        {currentReaction
          ? (
              <Image width={16} height={16} src={getCurrentReactionEmoji()!} alt="emoji icon" className="h-4 w-4 mt-1" />
            )
          : (
              <ThumbsUp className="h-4 w-4 mt-1" />
            )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full mb-2 left-0 bg-background border border-border rounded-full shadow-lg z-10 p-1"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex">
              {reactions.map(reaction => (
                <motion.button
                  key={reaction.type}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center hover:bg-muted rounded-full",
                    currentReaction === reaction.type && "bg-muted scale-110",
                  )}
                  onClick={() => handleReactionClick(reaction.type)}
                  title={reaction.label}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Image width={20} height={20} src={reaction.emoji} alt={reaction.label} className="h-6 w-6" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

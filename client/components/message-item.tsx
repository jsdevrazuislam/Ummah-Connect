import type { FC } from "react";

import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Ban, Eye, Flag, MoreHorizontal, Pencil, Reply, Smile, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState } from "react";

import { AudioPlayer } from "@/components/audio-player";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CompactEmojiPicker } from "@/components/custome-picker";
import { ReactionsModal } from "@/components/dialog/reactions-modal";
import HLSVideoPlayer from "@/components/hsl-video-player";
import { ReportModal } from "@/components/report-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDecryptedMessage } from "@/hooks/use-decrypted-message";
import { deleteMessage, reactToMessage, undoDeleteMessage } from "@/lib/apis/conversation";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";

type MessageItemProps = {
  message: ConversationMessages | undefined;
  user: User | null;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setReply: React.Dispatch<React.SetStateAction<ReplyMessage | null>>;
  setIsEditContent: React.Dispatch<React.SetStateAction<{
    enable: boolean;
    id: number | null;
  }>>;
};

const MessageItem: FC<MessageItemProps> = ({
  message,
  user,
  setMessage,
  setReply,
  setIsEditContent,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const encryptedSymmetricKey = user?.id === message?.senderId
    ? message?.keyForSender
    : message?.keyForRecipient;

  const decryptedText = useDecryptedMessage(
    message?.id,
    message?.content,
    encryptedSymmetricKey,
  );
  const encryptedParentSymmetricKey = user?.id === message?.parentMessage?.sender?.id
    ? message?.parentMessage?.keyForSender
    : message?.parentMessage?.keyForRecipient;

  const decryptedParentText = useDecryptedMessage(
    message?.parentMessageId ?? "",
    message?.parentMessage?.content,
    encryptedParentSymmetricKey,
  );

  const { mutate } = useMutation({
    mutationFn: reactToMessage,
    onError: (error) => {
      showError(error.message);
    },
  });

  const { mutate: deleteMessageFunc, isPending } = useMutation({
    mutationFn: deleteMessage,
    onError: (error) => {
      showError(error.message);
    },
  });

  const { mutate: undoDeleteMessageFunc } = useMutation({
    mutationFn: undoDeleteMessage,
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleReactPicker = (emoji: string) => {
    if (!message)
      return;
    mutate({ id: message?.id, emoji });
  };

  const handleDeleteMessage = () => {
    if (!message)
      return;
    deleteMessageFunc(message.id);
    setIsModalOpen(false);
  };

  const handleUndoDeleteMessage = () => {
    if (!message)
      return;
    undoDeleteMessageFunc(message.id);
  };

  const handlePostEdit = (text: string) => {
    setMessage(text);
    setIsEditContent({
      enable: true,
      id: message?.id ?? 0,
    });
  };

  const renderMessageType = (type: string, thumbnailUrl?: string, url?: string, duration?: number, isOwnMessage?: boolean) => {
    switch (type) {
      case "video":
        return (
          <HLSVideoPlayer
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/sp_auto/v1751778607/${url}.m3u8`}
            poster={thumbnailUrl}
            className="max-w-sm w-full lg:w-[384px]"
          />
        );
      case "audio":
        return <AudioPlayer isOwnMessage={isOwnMessage} audioUrl={url ?? ""} duration={String(duration)} />;
      case "image":
        return <Image width={285} height={200} src={url ?? ""} alt={user?.fullName ?? ""} className="w-[285px] h-[200px] object-cover self-end rounded-lg" />;
      default:
        return <p>{decryptedText}</p>;
    }
  };

  if (!message)
    return;

  return (
    <>
      <div key={message?.id} className={cn(`flex relative group ${message?.senderId === user?.id ? "justify-end items-end flex-col" : "justify-start"} mt-8 mb-8`, { "opacity-70": message?.status === "sending" || message?.status === "failed" }, { "mt-14": message?.parentMessageId })}>
        {message?.senderId !== user?.id && (
          <Link href={`/${message?.sender?.username}`}>
            <Avatar className="h-8 w-8 mr-2 mt-1">
              <AvatarImage src={message?.sender?.avatar} alt={message?.sender?.fullName} />
              <AvatarFallback>{message?.sender?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        )}

        {
          message?.parentMessageId && message?.parentMessage && (
            <div className={cn("absolute -top-11 text-xs opacity-70 dark:opacity-60", { "ml-9": message?.senderId !== user?.id })}>
              <p className="flex items-center gap-1.5">
                <Reply className="w-4 h-4" />
                {getReplyText(
                  message.parentMessage.sender.id!,
                  message.sender.id!,
                  user?.id ?? 0,
                  message.parentMessage.sender.fullName!,
                  message.sender.fullName!,
                )}
              </p>

              <div className={cn("max-w-[450px] w-fit bg-black/10 dark:bg-white/30 px-4 py-2 rounded-full text-right cursor-pointer", {
                "ml-auto": message?.senderId === user?.id,
                "mr-auto": message?.senderId !== user?.id,
              })}
              >
                <p className="line-clamp-1">
                  {decryptedParentText}
                </p>
              </div>
            </div>
          )
        }
        <div
          className={cn("max-w-xl relative whitespace-pre-wrap break-words flex flex-col rounded-lg px-3 py-2 bg-muted", { "bg-primary text-primary-foreground": message?.senderId === user?.id })}
        >
          {
            message?.attachments?.length === 0 && !message?.isDeleted
              ? renderMessageType("text")
              : message?.attachments?.map(attachment => (
                  <React.Fragment key={attachment.id}>
                    {renderMessageType(attachment?.fileType, attachment?.thumbnailUrl, attachment?.fileUrl, attachment?.duration, user?.id === message?.senderId)}
                  </React.Fragment>
                ))
          }
          {
            message?.isDeleted && (
              <div className="italic flex items-center gap-2">
                <Ban />
                {message?.senderId === user?.id ? "You" : message?.sender?.fullName}
                {" "}
                are deleted this message
                {
                  message?.senderId === user?.id && <button onClick={handleUndoDeleteMessage} className=" cursor-pointer font-semibold">Undo</button>
                }

              </div>
            )
          }
          {
            message?.reactions?.length > 0 && (
              <button onClick={() => setShowReactions(true)} className="px-1 absolute -bottom-4 bg-gray-300 dark:bg-gray-700 left-0 rounded-full flex items-center justify-center">
                {
                  message?.reactions?.map(react => (
                    <span key={react.id} className="text-sm cursor-pointer">{react?.emoji}</span>
                  ))
                }
              </button>
            )
          }
          <div className={cn("text-xs flex items-center justify-end gap-2 mt-1 text-muted-foreground", { "text-primary-foreground/70": message?.senderId === user?.id, "text-white": message?.attachments?.length !== 0 })}>
            {message?.isUpdated && (
              <span>Edited</span>
            )}
            <span>
              {format(new Date(message?.sentAt ?? ""), "hh:mmaaaaa'm'")}
            </span>
            {
              message?.senderId === user?.id && (
                <span className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  {renderMessageStatus(message?.statuses ?? [], false)}
                </span>
              )
            }
          </div>

          <div
            onMouseLeave={() => setShowEmojiPicker(false)}
            className={cn(
              "absolute items-center top-3 flex z-10 right-0 translate-x-full pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              {
                "left-0 -translate-x-[90px] pr-2 dark:text-white text-black": message?.senderId === user?.id,
                "hidden": message?.isDeleted,
              },
            )}
          >

            <div className="relative">
              <Button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                variant="ghost"
                size="icon"
                className="cursor-pointer bg-transparent p-0 h-6 w-6"
                aria-label="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </Button>

              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className={cn(
                    "absolute bottom-2 z-20",
                    {
                      "left-2": message?.senderId !== user?.id,
                      "right-0": message?.senderId === user?.id,
                    },
                  )}
                >
                  <CompactEmojiPicker
                    onSelect={(emoji) => {
                      handleReactPicker(emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
            <Button
              onClick={() => setReply({
                fullName: message?.senderId === user?.id ? "Yourself" : message?.sender?.fullName,
                id: message?.id,
                content: decryptedText ?? "",
                conversationId: message?.conversationId,
                receiverId: message?.senderId,

              })}
              variant="ghost"
              size="icon"
              className="cursor-pointer bg-transparent p-0 h-6 w-6"
            >
              <Reply className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer bg-transparent p-0 h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" sideOffset={4}>

                {user?.id === message?.senderId
                  ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePostEdit(decryptedText ?? "")} className="flex flex-col items-start gap-1 py-2">
                          <div className="flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-sm">Edit</span>
                          </div>
                          <p className="text-xs text-muted-foreground pl-6">
                            Modify the details of this post.
                          </p>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="flex flex-col items-start gap-1 py-2">
                          <div className="flex items-center gap-2">
                            <Trash className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-sm">Delete</span>
                          </div>
                          <p className="text-xs text-muted-foreground pl-6">
                            Permanently remove this message.
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
          </div>
        </div>

        {message?.status === "failed" && (
          <span className="text-xs text-red-500">Failed to send</span>
        )}
        {message?.status === "sending" && (
          <span className="text-xs text-gray-300">sending..</span>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        id={2}
      />

      <ReactionsModal
        isOpen={showReactions}
        onClose={() => setShowReactions(false)}
        reactions={message?.reactions ?? []}
        currentUserId={user?.id}
        messageId={message?.id ?? 0}
      />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteMessage}
        title="Delete Message?"
        description="This message will be hidden from everyone immediately. You can undo this action within 12 hours. After that, it will be permanently deleted automatically."
        type="delete"
        isLoading={isPending}
      />
    </>
  );
};

function getReplyText(
  parentSenderId: number,
  replySenderId: number,
  currentUserId: number,
  parentSenderName: string,
  replySenderName: string,
): string {
  const isYouSender = replySenderId === currentUserId;
  const isYouParent = parentSenderId === currentUserId;

  if (isYouSender && isYouParent) {
    return "You replied to yourself";
  }

  if (isYouSender) {
    return `You replied to ${parentSenderName}`;
  }

  if (isYouParent) {
    return `${replySenderName} replied to you`;
  }

  return `${replySenderName} replied to ${parentSenderName}`;
}

function renderMessageStatus(statuses: MessageStatus[], isGroupMessage: boolean) {
  if (!statuses || statuses.length === 0)
    return null;

  if (!isGroupMessage) {
    const status = statuses[0].status;
    switch (status) {
      case "seen":
        return <Eye className="w-3 h-3" />;
      case "delivered":
        return "✓✓";
      case "sent":
      default:
        return "✓";
    }
  }

  const allSeen = statuses.every(s => s.status === "seen");
  const allDelivered = statuses.every(s => s.status === "delivered" || s.status === "seen");

  if (allSeen) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Eye className="w-3 h-3" />
        </TooltipTrigger>
        <TooltipContent>
          Seen by all
        </TooltipContent>
      </Tooltip>
    );
  }

  if (allDelivered) {
    return (
      <Tooltip>
        <TooltipTrigger>✓✓</TooltipTrigger>
        <TooltipContent>
          Delivered to all
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>✓</TooltipTrigger>
      <TooltipContent>
        {statuses.filter(s => s.status === "sent").length}
        {" "}
        sent,
        {statuses.filter(s => s.status === "delivered").length}
        {" "}
        delivered,
        {statuses.filter(s => s.status === "seen").length}
        {" "}
        seen
      </TooltipContent>
    </Tooltip>
  );
}

export default MessageItem;

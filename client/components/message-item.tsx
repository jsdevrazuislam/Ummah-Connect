import { format } from "date-fns"
import React, { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AudioPlayer } from "@/components/audio-player"
import { FC } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import HLSVideoPlayer from "@/components/hsl-video-player"
import { Ban, Eye, Flag, MoreHorizontal, Pencil, Reply, Smile, Trash } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ReportModal } from "@/components/report-modal"
import { useDecryptedMessage } from "@/hooks/use-decrypted-message"
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes"

interface MessageItemProps {
    message: ConversationMessages | undefined
    user: User | null
    setMessage: React.Dispatch<React.SetStateAction<string>>
    setReply: React.Dispatch<React.SetStateAction<ReplyMessage | null>>
}

const MessageItem: FC<MessageItemProps> = ({
    message,
    user,
    setMessage,
    setReply
}) => {

    const [showReportModal, setShowReportModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme()

    const encryptedSymmetricKey = user?.id === message?.sender_id
        ? message?.key_for_sender
        : message?.key_for_recipient

    const decryptedText = useDecryptedMessage(
        message?.id,
        message?.content,
        encryptedSymmetricKey
    )


    const renderMessageType = (type: string, thumbnail_url?: string, url?: string, duration?: number, isOwnMessage?: boolean) => {
        switch (type) {
            case 'video':
                return <HLSVideoPlayer
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/sp_auto/v1751778607/${url}.m3u8`}
                    poster={thumbnail_url}
                    className="max-w-sm w-full lg:w-[384px]"
                />
            case 'audio':
                return <AudioPlayer isOwnMessage={isOwnMessage} audioUrl={url ?? ''} duration={String(duration)} />
            case 'image':
                return <Image width={285} height={200} src={url ?? ''} alt={user?.full_name ?? ''} className="w-[285px] h-[200px] object-cover self-end rounded-lg" />
            default:
                return <p>{decryptedText}</p>
        }
    }

    return (
        <>
            <div key={message?.id} className={cn(`flex group ${message?.sender_id === user?.id ? "justify-end items-end flex-col" : "justify-start"} mt-4 mb-4`, { "opacity-70": message?.status === 'sending' || message?.status === 'failed' })}>
                {message?.sender_id !== user?.id && (
                    <Link href={`/${message?.sender?.username}`}>
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarImage src={message?.sender?.avatar} alt={message?.sender?.full_name} />
                            <AvatarFallback>{message?.sender?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                )}
                <div
                    className={cn("max-w-xl relative whitespace-pre-wrap break-words flex flex-col rounded-lg px-3 py-2 bg-muted", { "bg-primary text-primary-foreground": message?.sender_id === user?.id })}
                >
                    {
                        message?.attachments?.length === 0 ? renderMessageType('text') : message?.attachments?.map((attachment) => (
                            <React.Fragment key={attachment.id}>
                                {renderMessageType(attachment?.file_type, attachment?.thumbnail_url, attachment?.file_url, attachment?.duration, user?.id === message?.sender_id)}
                            </React.Fragment>
                        ))
                    }
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <span
                            className={cn('text-xs text-muted-foreground', { "text-primary-foreground/70": message?.sender_id === user?.id, "text-white": message?.attachments?.length !== 0 })}
                        >
                            {format(new Date(message?.sent_at ?? ''), "hh:mmaaaaa'm'")}
                        </span>
                        {message?.sender_id === user?.id && (
                            <span className="text-xs text-primary-foreground/70">
                                {message?.statuses?.[0]?.status === 'sent' ? "✓" : message?.statuses?.[0]?.status === 'delivered' ? "✓✓" : <Eye className="w-3 h-3" />}
                            </span>
                        )}
                    </div>

                    <div
                    onMouseLeave={() => setShowEmojiPicker(false)}
                    className={cn(
                        "absolute items-center top-3 flex z-10 right-0 translate-x-full pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200", { "left-0 -translate-x-[90px] pr-2 dark:text-white text-black": message?.sender_id === user?.id }
                    )}>
                        <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} variant='ghost' size='icon' className="cursor-pointer bg-transparent p-0 h-6 w-6">
                            <Smile className="w-5 h-5" />
                        </Button>
                        {showEmojiPicker && (
                            <div ref={emojiPickerRef} className={cn('absolute emoji_picker w-[250px] h-[300px] overflow-y-scroll bottom-2 left-2 z-10', {"-left-20": message?.sender_id === user?.id })}>
                                <Picker
                                    data={emojiData}
                                    onEmojiSelect={(emoji: EmojiPicker) => console.log(emoji.native)}
                                    theme={theme}
                                    previewPosition="none"
                                    searchPosition
                                />
                            </div>
                        )}
                        <Button onClick={() => setReply({
                            full_name: message?.sender_id === user?.id ? 'Yourself':  message?.sender?.full_name,
                            id: message?.id,
                            content: decryptedText ?? '',
                            conversation_id: message?.conversation_id

                        })} variant='ghost' size='icon' className="cursor-pointer bg-transparent p-0 h-6 w-6">
                            <Reply className="w-5 h-5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon' className="cursor-pointer bg-transparent p-0 h-6 w-6">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="center" sideOffset={4}>
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
                                {user?.id === message?.sender_id && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setMessage(decryptedText ?? '')} className="flex flex-col items-start gap-1 py-2">
                                            <div className="flex items-center gap-2">
                                                <Pencil className="w-4 h-4 text-blue-500" />
                                                <span className="font-medium text-sm">Edit</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Modify the details of this post.
                                            </p>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                                            <div className="flex items-center gap-2">
                                                <Trash className="w-4 h-4 text-red-500" />
                                                <span className="font-medium text-sm">Delete</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Permanently remove this message.
                                            </p>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {message?.status === 'failed' && (
                    <span className="text-xs text-red-500">Failed to send</span>
                )}
                {message?.status === 'sending' && (
                    <span className="text-xs text-gray-300">sending..</span>
                )}
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                id={2}
            />
        </>
    )
}

export default MessageItem

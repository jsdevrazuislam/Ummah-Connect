import { format } from "date-fns"
import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AudioPlayer } from "@/components/audio-player"
import { FC } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import HLSVideoPlayer from "@/components/hsl-video-player"
import { Eye } from "lucide-react"

interface MessageItemProps {
    message: ConversationMessages | undefined
    user: User | null
}

const MessageItem: FC<MessageItemProps> = ({
    message,
    user
}) => {

    const renderMessageType = (type: string, thumbnail_url?:string, url?: string, duration?: number) => {
        switch (type) {
            case 'video':
                return <HLSVideoPlayer
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/sp_auto/v1751778607/${url}.m3u8`}
                    poster={thumbnail_url}
                    className="max-w-sm w-full lg:w-[384px]"
                />
            case 'audio':
                return <AudioPlayer audioUrl={url ?? ''} duration={String(duration)} />
            case 'image':
                return <Image width={285} height={200} src={url ?? ''} alt={user?.full_name ?? ''} className="w-[285px] h-[200px] object-cover self-end rounded-lg" />
            default:
                return <p>{message?.content}</p>

        }
    }

    return (
        <>
            <div key={message?.id} className={cn(`flex ${message?.sender_id === user?.id ? "justify-end items-end flex-col" : "justify-start"} mt-4 mb-4`, { "opacity-70": message?.status === 'sending' || message?.status === 'failed' })}>
                {message?.sender_id !== user?.id && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={message?.sender?.avatar} alt={message?.sender?.full_name} />
                        <AvatarFallback>{message?.sender?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={cn("max-w-[70%] flex flex-col rounded-lg px-3 py-2 bg-muted", { "bg-primary text-primary-foreground": message?.sender_id === user?.id })}
                >
                    {
                        message?.attachments?.length === 0 ? renderMessageType('text') : message?.attachments?.map((attachment) => (
                            <React.Fragment key={attachment.id}>
                                {renderMessageType(attachment?.file_type, attachment?.thumbnail_url, attachment?.file_url, attachment?.duration)}
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
                </div>
                {message?.status === 'failed' && (
                    <span className="text-xs text-red-500">Failed to send</span>
                )}
                {message?.status === 'sending' && (
                    <span className="text-xs text-gray-300">sending..</span>
                )}
            </div>
        </>
    )
}

export default MessageItem
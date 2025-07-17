import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FC } from "react"
import { useCallActions } from "@/hooks/use-call-store"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from "@tanstack/react-query"
import { initialize_call } from "@/lib/apis/stream"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"


interface ConversationHeaderProps {
    getIsUserOnline: (userId: number) => boolean
    getUserLastSeen: (userId: number) => number
    selectedConversation: MessageSender | null
    className?:string
}


const ConversationHeader: FC<ConversationHeaderProps> = ({
    getIsUserOnline,
    selectedConversation,
    getUserLastSeen,
    className
}) => {

    const { mutate } = useMutation({
        mutationFn: initialize_call,
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const { startCall } = useCallActions();
    const router = useRouter()

    const handleStartCall = (callType: 'audio' | 'video') => {
        if (!selectedConversation || !selectedConversation?.id) return;
        const authToken = uuidv4();
        const roomName = `call-${selectedConversation.id}-${Date.now()}`;
        mutate({
            roomName,
            callType: callType,
            authToken,
            receiverId: String(selectedConversation?.id),
        })
        startCall(callType, roomName);
        router.push(`/call?room=${roomName}&type=${callType}&authToken=${authToken}`);
    };

    if (!selectedConversation) return

    return (
        <>
            <div className={cn(`p-4 md:border-b md:border-border w-full flex justify-between items-center`, className)}>
                <Link href={`/${selectedConversation?.username}`} className="flex items-center gap-3 cursor-pointer">
                    <Avatar>
                        <AvatarImage src={selectedConversation?.avatar} alt={selectedConversation?.full_name} />
                        <AvatarFallback>{selectedConversation?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium capitalize">{selectedConversation?.full_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                            {getIsUserOnline(selectedConversation?.id) ? 'Online' : getUserLastSeen(selectedConversation?.id) === 0 ? formatDistanceToNow(new Date(selectedConversation?.last_seen_at ?? '')) : formatDistanceToNow(new Date(getUserLastSeen(selectedConversation?.id)), { addSuffix: true })}
                        </div>
                    </div>
                </Link>
                <div className="flex">
                    <Button variant="ghost" size="icon" onClick={() => handleStartCall("audio")}>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleStartCall("video")}>
                        <Video className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ConversationHeader
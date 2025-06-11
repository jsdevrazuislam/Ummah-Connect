import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FC } from "react"
import { useCallActions } from "@/hooks/use-call-store"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/store"
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from "@tanstack/react-query"
import { initialize_call } from "@/lib/apis/stream"
import { toast } from "sonner"


interface ConversationHeaderProps {
    getIsUserOnline: (userId: number) => boolean
    getUserLastSeen: (userId: number) => number
    selectedConversation: MessageSender | null
}


const ConversationHeader: FC<ConversationHeaderProps> = ({
    getIsUserOnline,
    selectedConversation,
    getUserLastSeen,
}) => {

    const { mutate } = useMutation({
        mutationFn: initialize_call,
        onError:(error)=>{
            toast.error(error.message)
        }
    })
    const { startCall } = useCallActions();
    const { socket } = useSocketStore()
    const router = useRouter()
    const { user } = useAuthStore()

    const handleStartCall = (callType: 'audio' | 'video') => {
        if (!selectedConversation || !selectedConversation?.id) return;
        const authToken = uuidv4();
        const roomName = `call-${selectedConversation.id}-${Date.now()}`;

        socket?.emit(SocketEventEnum.OUTGOING_CALL, {
            from: user?.id,
            to: selectedConversation?.id,
            callType: callType,
            roomName: roomName,
            callerName: user?.full_name,
            callerAvatar: user?.avatar,
            authToken
        });
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
            <div className="p-4 md:border-b md:border-border w-full flex justify-between items-center">
                <div className="flex items-center gap-3">
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
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleStartCall("audio")}>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleStartCall("video")}>
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ConversationHeader
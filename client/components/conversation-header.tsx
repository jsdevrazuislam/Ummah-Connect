import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FC } from "react"

interface ConversationHeaderProps {
    getIsUserOnline: (userId: number) => boolean
    getUserLastSeen: (userId: number) => number
    selectedConversation: MessageSender | null
    startCall: (type: "audio" | "video") => void
}


const ConversationHeader: FC<ConversationHeaderProps> = ({
    getIsUserOnline,
    selectedConversation,
    getUserLastSeen,
    startCall,
}) => {

    if (!selectedConversation) return

    return (
        <>
            <div className="p-4 border-b border-border flex justify-between items-center">
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
                    <Button variant="ghost" size="icon" onClick={() => startCall("audio")}>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startCall("video")}>
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
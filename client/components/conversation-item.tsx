import React, { FC, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocketStore } from '@/hooks/use-socket'
import SocketEventEnum from '@/constants/socket-event'
import { useStore } from '@/store/store'
import { useConversationStore } from '@/hooks/use-conversation-store'
import { formatDistanceToNow } from 'date-fns';
import { getFromIndexedDB } from '@/lib/indexedDB'
import { decryptMessageForBothParties } from '@/lib/e2ee'



interface ConversationItemProps {
    conv: Conversation,
    onClick: () => void
}

const ConversationItem: FC<ConversationItemProps> = ({ conv, onClick }) => {

     const [decryptedText, setDecryptedText] = useState<string | null>(null);
    const { socket } = useSocketStore()
    const { getIsUserOnline, user } = useStore()
    const { unreadCounts } = useConversationStore();
    const unreadCount = unreadCounts[conv.id] ?? 0;

    useEffect(() => {
        if (!socket) return;
        socket.emit(SocketEventEnum.JOIN_CONVERSATION, conv.id.toString());
        return () => {
            socket.off(SocketEventEnum.JOIN_CONVERSATION);
        };
    }, [socket, conv]);

    useEffect(() => {
            if(conv){
                (async () =>{
                    try {
                        const privateKey = await getFromIndexedDB<CryptoKey>("privateKey");
                        if (!privateKey) return setDecryptedText("[Private Key Missing]");
                         const encryptedSymmetricKey = user?.id === conv?.lastMessage?.sender?.id
                        ? conv?.lastMessage?.key_for_sender
                        : conv?.lastMessage?.key_for_recipient;
    
                        const decrypted = await decryptMessageForBothParties(conv?.lastMessage?.content ?? '', encryptedSymmetricKey ?? '', privateKey);
                        setDecryptedText(decrypted);
                    } catch (err) {
                        console.error("Decryption failed", err);
                        setDecryptedText("[Failed to decrypt]");
                    }
            })()
            }
        }, [conv]);

    return (
        <div
            className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer`}
            key={conv.id}
            onClick={onClick}
        >
            <div className="flex gap-3 items-center">
                <div className="relative">
                    <Avatar>
                        <AvatarImage src={conv?.avatar} alt={conv?.name} />
                        <AvatarFallback>{conv?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {getIsUserOnline(conv.userId ?? 0) ? (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background"></span>
                    ) : (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-gray-300 border-2 border-background"></span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <span className="font-medium truncate capitalize">{conv?.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv?.createdAt ?? ''))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">{conv?.lastMessage?.sender?.id === user?.id ? `You: ${decryptedText}` : decryptedText}</p>
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConversationItem
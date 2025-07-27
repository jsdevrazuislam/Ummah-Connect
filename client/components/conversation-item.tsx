import React, { FC, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocketStore } from '@/hooks/use-socket'
import SocketEventEnum from '@/constants/socket-event'
import { useStore } from '@/store/store'
import { useConversationStore } from '@/hooks/use-conversation-store'
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Trash2, Archive, Flag } from "lucide-react";
import { useRouter } from 'next/navigation'
import { useDecryptedMessage } from '@/hooks/use-decrypted-message'
import { ConfirmationModal } from '@/components/confirmation-modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { delete_conversation } from '@/lib/apis/conversation'
import { toast } from 'sonner'
import { removeConversation } from '@/lib/update-conversation'



interface ConversationItemProps {
    conv: Conversation,
    onClick: () => void
}

const ConversationItem: FC<ConversationItemProps> = ({ conv, onClick }) => {

    const { socket } = useSocketStore()
    const router = useRouter()
    const { getIsUserOnline, user, setSelectedConversation } = useStore()
    const queryClient = useQueryClient()
    const { unreadCounts } = useConversationStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const unreadCount = unreadCounts[conv.id] ?? 0;
    const encryptedSymmetricKey = user?.id === conv?.lastMessage?.sender?.id
        ? conv?.lastMessage?.key_for_sender
        : conv?.lastMessage?.key_for_recipient;

    const decryptedText = useDecryptedMessage(
        conv?.lastMessage?.id,
        conv?.lastMessage?.content,
        encryptedSymmetricKey
    )

    const { isPending, mutate } = useMutation({
        mutationFn: delete_conversation,
        onError: (error) => {
            toast.error(error.message)
        }
    })


    const handleDeletePost = () => {
        mutate(conv.id)
        queryClient.setQueryData(['get_conversations'], (oldData: QueryOldDataPayloadConversations) => {
            return removeConversation(oldData, conv.id)
        })
        setSelectedConversation(null)
    }

    useEffect(() => {
        if (!socket) return;
        socket.emit(SocketEventEnum.JOIN_CONVERSATION, conv.id.toString());
        return () => {
            socket.off(SocketEventEnum.JOIN_CONVERSATION);
        };
    }, [socket, conv]);

    return (
        <div className='relative group'>
            <div
                className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer relative`}
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
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv?.lastMessage?.sent_at ?? ''))}</span>
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

            <div className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 bg-gray-400 hover:bg-gray-400 rounded-full p-0">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" sideOffset={4} className="w-56">
                        <DropdownMenuItem onClick={() => router.replace(`/${conv.username}`)}>
                            <User className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                                <div>View Profile</div>
                                <p className="text-xs text-muted-foreground">See user details</p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                            <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                                <div>Delete Chat</div>
                                <p className="text-xs text-muted-foreground">Permanently remove this chat</p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                                <div>Archive Chat</div>
                                <p className="text-xs text-muted-foreground">Move to archived list</p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                                <div>Report</div>
                                <p className="text-xs text-muted-foreground">Report this conversation</p>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleDeletePost}
                    title="Delete this conversation?"
                    description="This will permanently delete the conversation and all chats are deleted"
                    type="delete"
                    isLoading={isPending}
                />
            </div>
        </div>
    )
}

export default ConversationItem
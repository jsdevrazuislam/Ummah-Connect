import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Maximize2, Minimize2, MessageSquare } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create_conversation } from '@/lib/apis/conversation'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { addedConversation } from '@/lib/update-conversation'
import { encryptMessageForBothParties, importPublicKey } from '@/lib/e2ee'
import { useStore } from '@/store/store'


type Message = {
  id: string
  text: string
  sender: 'me' | 'them'
  time: string
}

type ChatWindow = {
  userId: number
  name: string
  avatar: string | undefined
  online: boolean
  minimized: boolean
  messages: Message[]
}

export default function MessageButton({ user }: { user: PostAuthor }) {
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([])
  const { user: currentUser } = useStore()
  const [messageInput, setMessageInput] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()
  const getDisabledState = () => {
    switch (user.privacy_settings?.message) {
      case 'nobody':
        return { disabled: true, reason: "This user doesn't accept messages" }
      case 'followers':
        return {
          disabled: !user?.isFollowing,
          reason: user?.isFollowing
            ? "Message this user"
            : "You need to follow this user to message them"
        }
      case 'everyone':
      default:
        return { disabled: false, reason: "Message this user" }
    }
  }

  const { disabled } = getDisabledState()


  const { mutate, isPending } = useMutation({
    mutationFn: create_conversation,
    onSuccess: (data) => {
      queryClient.setQueryData(['get_conversations'], (oldData: QueryOldDataPayloadConversations) => {
        return addedConversation(oldData, data?.data, data?.data?.id)
      })
      setChatWindows(prev =>
        prev.map(w =>
          w.userId === user?.id
            ? { ...w, messages: [...w.messages, data] }
            : w
        )
      )
      setMessageInput('')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })



  const openChatWindow = () => {
    if(disabled) return
    setChatWindows(prev => {
      const existingIndex = prev.findIndex(w => w.userId === user.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], minimized: false }
        return updated
      }

      return [
        ...prev,
        {
          userId: user?.id,
          name: user?.full_name,
          avatar: user?.avatar,
          online: true,
          minimized: false,
          messages: []
        }
      ]
    })
  }

  const closeChatWindow = (userId: number) => {
    setChatWindows(prev => prev.filter(w => w.userId !== userId))
  }

  const toggleMinimize = (userId: number) => {
    setChatWindows(prev =>
      prev.map(w =>
        w.userId === userId ? { ...w, minimized: !w.minimized } : w
      )
    )
  }

  const sendMessage = async () => {
    if (messageInput.trim() === '') return
    const recipientKey = await importPublicKey(user?.public_key ?? '');
    const senderKey = await importPublicKey(currentUser?.public_key ?? '');
    const { content, key_for_recipient, key_for_sender } =  await encryptMessageForBothParties(messageInput,  senderKey, recipientKey)

    mutate({
      receiverId: String(user?.id),
      messageType: 'text',
      type: 'private',
      content,
      key_for_recipient,
      key_for_sender
    })

  }

  return (
    <>
      <Button
            size="sm"
            onClick={openChatWindow}
            className="flex items-center gap-2"
            disabled={disabled}
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
        {chatWindows.map((window, index) => (
          <div
            key={window.userId}
            className={`bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col ${window.minimized ? 'w-64 h-12' : 'w-80 h-96'
              }`}
            style={{
              zIndex: 50 + index,
              transform: window.minimized ? `translateY(${index * 50}px)` : 'none'
            }}
          >
            <div
              className="p-3 border-b flex items-center justify-between bg-muted/50 cursor-pointer"
              onClick={() => toggleMinimize(window?.userId)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={window?.avatar} alt={window?.name} />
                  <AvatarFallback>{window?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{window?.name}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMinimize(window?.userId)
                  }}
                >
                  {window.minimized ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeChatWindow(window?.userId)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {!window.minimized && (
              <>
                <div className="flex flex-col justify-center items-center gap-2 py-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={window?.avatar} alt={window?.name} />
                    <AvatarFallback>{window?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{window?.name}</span>
                  {!user?.isFollowing && <p className='text-sm'>You aren't following on ummah connect</p>}

                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3 flex justify-center items-center">
                    {window?.messages?.length > 0 && <Button onClick={() => router.push('/messages')}>View Conversation</Button>}
                  </div>
                </ScrollArea>

                {window?.messages?.length === 0 && <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) =>
                        e.key === 'Enter' && sendMessage()
                      }
                      disabled={isPending}
                    />
                    <Button
                      size="sm"
                      onClick={() => sendMessage()}
                    >
                      {isPending ? 'Creating...' : 'Send'}
                    </Button>
                  </div>
                </div>}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
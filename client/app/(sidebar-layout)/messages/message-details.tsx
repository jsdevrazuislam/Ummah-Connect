"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Search, Users, MessageSquare, Plus, ChevronLeft } from "lucide-react"
import ConversationSkeleton from "@/components/conversation-loading"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get_conversation_messages, get_conversations, read_message, send_attachment, send_message } from "@/lib/apis/conversation"
import { InfiniteScroll } from "@/components/infinite-scroll"
import Loader from "@/components/loader"
import { useStore } from "@/store/store"
import { toast } from "sonner"
import { addMessageConversation, replaceMessageInConversation, updatedUnReadCount } from "@/lib/update-conversation"
import { ScrollArea } from "@/components/ui/scroll-area"
import ConversationItem from "@/components/conversation-item"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import TypingIndicator from "@/components/type-indicator"
import ConversationHeader from "@/components/conversation-header"
import MessageForm from "@/components/message-form"
import MessageItem from "@/components/message-item"
import { loadTempDataForMessage } from "@/lib/temp-load-data"
import { CreateGroupDialog } from "@/components/create-group-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ErrorMessage } from "@/components/api-error"
import { useConversationStore } from "@/hooks/use-conversation-store"



export default function ConversationPage() {
  const [message, setMessage] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, selectedConversation, setSelectedConversation, getIsUserOnline, getUserLastSeen } = useStore()
  const queryClient = useQueryClient()
  const { socket } = useSocketStore()
  const { setBulkUnreadCounts, resetUnreadCount } = useConversationStore()
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
  const [recordingTime, setRecordingTime] = useState(0);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);



  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ConversationResponse>({
    queryKey: ['get_conversations'],
    queryFn: ({ pageParam = 1 }) => get_conversations({ page: Number(pageParam) }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const conversations = useMemo(() => {
    return data?.pages.flatMap(page => page?.data?.conversations) ?? [];
  }, [data]);


  const loadMoreConversation = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const {
    data: messagesData,
    fetchNextPage: messageNextPage,
    hasNextPage: messageHasNextPage,
    isFetchingNextPage: isMessageFetchNextPage,
    isLoading: messageLoading,
    isError: isMessageError,
  } = useInfiniteQuery<ConversationMessagesResponse>({
    queryKey: ['get_conversation_messages', selectedConversation?.conversationId],
    queryFn: ({ pageParam = 1 }) => get_conversation_messages({ page: Number(pageParam), id: selectedConversation?.conversationId }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!selectedConversation?.conversationId
  });

  const messages = messagesData?.pages.flatMap(page => page?.data?.messages) ?? [];

  const { mutate: readMessageFun } = useMutation({
    mutationFn: read_message,
    onSuccess: (_, variable) => {
      queryClient.setQueryData(['get_conversations'], (oldData: QueryOldDataPayloadConversations) => {
        return updatedUnReadCount(oldData, variable.conversationId)
      })
      resetUnreadCount(variable.conversationId)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: sendAttachmentFun, isPending: sendLoading } = useMutation({
    mutationFn: send_attachment,
    onSuccess: (newMessage, variable) => {
      const id = Number(variable?.get('id'))

      queryClient.setQueryData(['get_conversation_messages', Number(variable?.get("conversationId"))], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, id, { ...newMessage.data, status: 'sent' }, Number(variable?.get("conversationId")))
      })
    },
    onError: (error, variable) => {
      const id = Number(variable?.get('id'))
      const tempMessage = loadTempDataForMessage({ user, message, selectedConversation, status: 'failed', id })
      queryClient.setQueryData(['get_conversation_messages', Number(variable?.get("conversationId"))], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, id, tempMessage, Number(variable?.get("conversationId")))
      })
      toast.error(error.message)
    }
  })

  const { isPending, mutate } = useMutation({
    mutationFn: send_message,
    onSuccess: (newMessage, variable) => {
      setMessage("")
      queryClient.setQueryData(['get_conversation_messages', variable.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, variable.id, { ...newMessage.data, status: 'sent' }, variable.conversationId)
      })
    },
    onError: (error, variable) => {
      setMessage("")
      const tempMessage = loadTempDataForMessage({ user, message, selectedConversation, status: 'failed', id: variable.id })
      queryClient.setQueryData(['get_conversation_messages', variable.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, variable.id, tempMessage, variable.conversationId)
      })
      toast.error(error.message)
    }
  })

  const loadMoreMessage = () => {
    if (messageHasNextPage && !isMessageFetchNextPage) {
      messageNextPage();
    }
  };

  const handleSelectionMessage = (conv: Conversation) => {

    setSelectedConversation({
      full_name: conv.name ?? '',
      avatar: conv.avatar,
      username: conv.username ?? '',
      id: conv.userId ?? 0,
      conversationId: conv.id,
      last_seen_at: conv?.last_seen_at
    });

    readMessageFun({
      conversationId: conv.id,
      messageId: conv?.lastMessage?.id ?? 0,
    });
  };


  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => setIsTyping(false), 3000));
  };


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {

      const id = Date.now()
      const tempMessage = loadTempDataForMessage({ user, message, selectedConversation, status: 'sending', id })
      queryClient.setQueryData(['get_conversation_messages', selectedConversation?.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return addMessageConversation(oldData, tempMessage, selectedConversation?.conversationId ?? 0)
      })
      mutate({
        conversationId: selectedConversation?.conversationId ?? 0,
        type: 'text',
        content: message,
        id
      })
    }
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: Blob[] = [];

    setRecording(true)

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      setRecording(false)
      stream?.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      if (!blob) return;

      if (blob.size > 5 * 1024 * 1024) {
        toast.error("Audio is too large (max 5MB)");
        return;
      }

      const formData = new FormData();
      const tempId = Date.now()
      formData.append("media", blob);
      formData.append("id", String(tempId));
      formData.append("conversationId", String(selectedConversation?.conversationId));
      const tempMessage = loadTempDataForMessage({ user, message, selectedConversation, status: 'sending', id: tempId, attachments: [blob] })
      queryClient.setQueryData(['get_conversation_messages', selectedConversation?.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return addMessageConversation(oldData, tempMessage, selectedConversation?.conversationId ?? 0)
      })
      sendAttachmentFun(formData)
    };
    mediaRecorder.start();
    setRecorder(mediaRecorder);
  }

  const stopRecording = () => {
    recorder?.stop()
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.TYPING, ({ userId }) => {
      if (userId === selectedConversation?.id) {
        handleTyping();
      }
    });
    return () => {
      socket.off(SocketEventEnum.TYPING);
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unreadMap = conversations.reduce((acc, conv) => {
      acc[conv.id] = conv.unreadCount ?? 0;
      return acc;
    }, {} as Record<number, number>);
    setBulkUnreadCounts(unreadMap)
  }, [conversations])


  if (isError || isMessageError) {
    return <div className="flex justify-center items-center h-[90vh] ">
      <ErrorMessage type='network' />
    </div>
  }

  return (
    <div className="flex flex-1 h-screen bg-background">
      <div className="flex-1 flex flex-col md:flex-row">
        <div className={cn(
          "w-full border-r border-border",
          "md:w-80 md:block",
          selectedConversation ? "hidden" : "block"
        )}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold mb-4">Messages</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateGroup(true)} className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages" className="pl-10" />
            </div>
          </div>
          <div className="h-[calc(100vh-120px)] overflow-y-auto">
            <InfiniteScroll
              hasMore={hasNextPage}
              isLoading={isLoading}
              onLoadMore={loadMoreConversation}
            >
              <div>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <ConversationSkeleton key={i} />
                  ))
                ) : (
                  conversations?.length > 0 ? conversations.map((conv) => (
                    <ConversationItem key={conv.id} conv={conv} onClick={() => handleSelectionMessage(conv)} />
                  )) : <div className="text-center py-16 px-4 flex flex-col justify-center items-center rounded-lg">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No conversation yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start a new conversation to see it appear here
                    </p>
                  </div>
                )}

                {isFetchingNextPage && (
                  <>
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                  </>
                )}
              </div>
            </InfiniteScroll>
          </div>
        </div>

        {selectedConversation && !messageLoading ? (
          <div className={cn(
            "flex flex-col flex-1",
            "w-full",
            "md:w-[calc(100%-20rem)]"
          )}>
            <div className="md:hidden flex items-center px-4 py-1 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation(null)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <ConversationHeader
                selectedConversation={selectedConversation}
                getIsUserOnline={getIsUserOnline}
                getUserLastSeen={getUserLastSeen}
                className="p-0"
              />
            </div>

            <div className="hidden md:block">
              <ConversationHeader
                selectedConversation={selectedConversation}
                getIsUserOnline={getIsUserOnline}
                getUserLastSeen={getUserLastSeen}
              />
            </div>

            <ScrollArea className="flex-1 px-6 py-4 h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]">
              <InfiniteScroll
                hasMore={messageHasNextPage}
                isLoading={messageLoading}
                onLoadMore={loadMoreMessage}
              >
                <div>
                  {messages?.length > 0 ? messages.map((message) => (
                    <MessageItem key={message?.id} message={message} user={user} />
                  )) : <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Send a message to start the conversation
                    </p>
                  </div>}
                  <TypingIndicator isTyping={isTyping} />
                  <div ref={messagesEndRef} />
                </div>
              </InfiniteScroll>
            </ScrollArea>

            <MessageForm
              startRecording={startRecording}
              stopRecording={stopRecording}
              sendLoading={sendLoading}
              isPending={isPending}
              selectedConversation={selectedConversation}
              message={message}
              recordingTime={recordingTime}
              recording={recording}
              setShowEmojiPicker={setShowEmojiPicker}
              setMessage={setMessage}
              emojiPickerRef={emojiPickerRef}
              handleSendMessage={handleSendMessage}
              showEmojiPicker={showEmojiPicker}
              sendAttachmentFun={sendAttachmentFun}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center w-full">
            {
              messageLoading ? <Loader /> : <div className="flex justify-between items-center flex-col p-4">
                <h3 className="font-medium">Select a conversation</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations</p>
              </div>
            }
          </div>
        )}
      </div>
      <CreateGroupDialog open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </div>

  )
}
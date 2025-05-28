"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { SideNav } from "@/components/side-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Send, Phone, Video, Info, ImageIcon, Paperclip, Smile, Mic, Users, MessageSquare } from "lucide-react"
import { CallModal } from "@/components/call-modal"
import Link from "next/link"
import ConversationSkeleton from "@/app/(sidebar-layout)/messages/loading"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get_conversation_messages, get_conversations, send_message } from "@/lib/apis/conversation"
import { InfiniteScroll } from "@/components/infinite-scroll"
import Loader from "@/components/loader"
import { useAuthStore } from "@/store/store"
import { toast } from "sonner"
import { format } from "date-fns"
import { addMessageConversation } from "@/lib/update-conversation"
import { ScrollArea } from "@/components/ui/scroll-area"
import ConversationItem from "@/components/conversation-item"


export default function ConversationPage() {
  const [message, setMessage] = useState("")
  const [activeCall, setActiveCall] = useState<{ type: "audio" | "video" } | null>(null)
  const [incomingCall, setIncomingCall] = useState<{ type: "audio" | "video" } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedConversation, setSelectedConversation] = useState<MessageSender | null>(null)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
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

  const conversations = data?.pages.flatMap(page => page?.data?.conversations) ?? [];


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
    error: messageError,
  } = useInfiniteQuery<ConversationMessagesResponse>({
    queryKey: ['get_conversation_messages'],
    queryFn: ({ pageParam = 1 }) => get_conversation_messages({ page: Number(pageParam), id: selectedConversation?.id }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!selectedConversation?.id
  });

  const messages = messagesData?.pages.flatMap(page => page?.data?.messages) ?? [];

  const { isPending, mutate } = useMutation({
    mutationFn: send_message,
    onSuccess: (newMessage, variable) => {
      setMessage("")
      queryClient.setQueryData(['get_conversation_messages'], (oldData: QueryOldDataPayloadConversation) => {
        return addMessageConversation(oldData, newMessage.data, variable.conversationId)
      })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })


  const loadMoreMessage = () => {
    if (messageHasNextPage && !isMessageFetchNextPage) {
      messageNextPage();
    }
  };



  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Simulate incoming call after a delay
    const callTimer = setTimeout(() => {
      if (Math.random() > 0.7 && !activeCall && !incomingCall) {
        setIncomingCall({ type: Math.random() > 0.5 ? "audio" : "video" })
      }
    }, 30000) // 30 seconds

    return () => clearTimeout(callTimer)
  }, [activeCall, incomingCall])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      mutate({
        conversationId: selectedConversation?.id ?? 0,
        type: 'text',
        content: message
      })
    }
  }

  const startCall = (type: "audio" | "video") => {
    setActiveCall({ type })
  }

  const handleCloseCall = () => {
    setActiveCall(null)
    setIncomingCall(null)
  }

  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      setActiveCall(incomingCall)
      setIncomingCall(null)
    }
  }

  if (isError) {
    return <div className="text-red-500 text-center py-4">Error loading conversation: {error?.message}</div>;
  }


  return (
    <div className="flex flex-1 h-screen bg-background">
      <div className="flex-1 flex">
        <div className="w-full md:w-80 border-r border-border">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages" className="pl-10" />
            </div>
          </div>
          <div>
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
                    <ConversationItem key={conv.id} conv={conv} onClick={() => setSelectedConversation({
                      full_name: conv.name ?? '',
                      avatar: conv.avatar,
                      username: '',
                      id: 1
                    })} />
                  )) : <div className="text-center py-16 flex flex-col justify-center items-center rounded-lg">
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

        {
          selectedConversation && !messageLoading ? <div className="flex flex-col flex-1">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation?.avatar} alt={selectedConversation?.full_name} />
                  <AvatarFallback>{selectedConversation?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium capitalize">{selectedConversation?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{true ? "Online" : "Offline"}</div>
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

            <ScrollArea className="flex-1 p-4">
              <InfiniteScroll
                hasMore={messageHasNextPage}
                isLoading={messageLoading}
                onLoadMore={loadMoreMessage}
              >
                <div>
                  {messages?.length > 0 ? messages.map((message) => (
                    <div key={message?.id} className={`flex ${message?.sender_id === user?.id ? "justify-end" : "justify-start"} mt-4 mb-4`}>
                      {message?.sender_id !== user?.id && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src={message?.sender?.avatar} alt={message?.sender?.full_name} />
                          <AvatarFallback>{message?.sender?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${message?.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                      >
                        <p>{message?.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span
                            className={`text-xs ${message?.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                          >
                            {format(new Date(message?.sent_at ?? ''), "hh:mmaaaaa'm'")}
                          </span>
                          {message?.sender_id === user?.id && (
                            <span className="text-xs text-primary-foreground/70">
                              {message?.status === "sent" ? "✓" : message?.status === "delivered" ? "✓✓" : "✓✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Send a message to start the conversation
                    </p>
                  </div>}
                  <div ref={messagesEndRef} />
                </div>
              </InfiniteScroll>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                {message.trim() ? (
                  <Button onClick={handleSendMessage} disabled={isPending} type="submit" size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" size="icon" className="shrink-0">
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </form>
            </div>
          </div> : <div className="flex flex-1 items-center justify-center">
            {messageLoading ? <Loader /> : <div className="flex justify-between items-center flex-col p-4">
              <h3 className="font-medium">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations</p>
            </div>}
          </div>
        }

      </div>
      {/* Call modals */}
      {/* {activeCall && <CallModal user={conversation.user} callType={activeCall.type} onClose={handleCloseCall} />} */}
      {/* {incomingCall && (
        <CallModal user={conversation.user} callType={incomingCall.type} onClose={handleCloseCall} incoming={true} />
      )} */}
    </div>
  )
}

"use client";

import type React from "react";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, MessageSquare, Plus, Search, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { ErrorMessage } from "@/components/api-error";
import ConversationHeader from "@/components/conversation-header";
import ConversationItem from "@/components/conversation-item";
import ConversationSkeleton from "@/components/conversation-loading";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { InfiniteScroll } from "@/components/infinite-scroll";
import Loader from "@/components/loader";
import MessageItem from "@/components/message-item";
import TypingIndicator from "@/components/type-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import SocketEventEnum from "@/constants/socket-event";
import { useConversationStore } from "@/hooks/use-conversation-store";
import { useSocketStore } from "@/hooks/use-socket";
import { editMessage, getConversationMessages, getConversations, readMessage, replyToMessage, sendAttachment, sendMessage } from "@/lib/apis/conversation";
import { encryptMessageForBothParties, importPublicKey } from "@/lib/e2ee";
import { loadTempDataForMessage } from "@/lib/temp-load-data";
import { showError } from "@/lib/toast";
import { addMessageConversation, replaceMessageInConversation, replaceSendMessageInConversation, updatedUnReadCount } from "@/lib/update-conversation";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";

const MessageForm = dynamic(() => import("@/components/message-form"), { ssr: false });

export default function ConversationPage() {
  const [message, setMessage] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, selectedConversation, setSelectedConversation, getIsUserOnline, getUserLastSeen } = useStore();
  const queryClient = useQueryClient();
  const { socket } = useSocketStore();
  const { resetUnreadCount } = useConversationStore();
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
  const [recordingTime, setRecordingTime] = useState(0);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState<ReplyMessage | null>(null);
  const [isEditContent, setIsEditContent] = useState<{ enable: boolean; id: number | null }>({
    enable: false,
    id: null,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ConversationResponse>({
    queryKey: ["get_conversations"],
    queryFn: ({ pageParam = 1 }) => getConversations({ page: Number(pageParam) }),
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
    queryKey: ["get_conversation_messages", selectedConversation?.conversationId],
    queryFn: ({ pageParam = 1 }) => getConversationMessages({ page: Number(pageParam), id: selectedConversation?.conversationId }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!selectedConversation?.conversationId,
  });

  const messages = useMemo(
    () => messagesData?.pages.flatMap(page => page?.data?.messages) ?? [],
    [messagesData],
  );

  const { mutate: readMessageFun } = useMutation({
    mutationFn: readMessage,
    onSuccess: (_, variable) => {
      queryClient.setQueryData(["get_conversations"], (oldData: QueryOldDataPayloadConversations) => {
        return updatedUnReadCount(oldData, variable.conversationId);
      });
      resetUnreadCount(variable.conversationId);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const { mutate: editMessageFunc } = useMutation({
    mutationFn: editMessage,
    onError: (error) => {
      showError(error.message);
    },
  });

  const { mutate: sendAttachmentFun, isPending: sendLoading } = useMutation({
    mutationFn: sendAttachment,
    onSuccess: (newMessage, variable) => {
      const id = Number(variable?.get("id"));

      queryClient.setQueryData(["get_conversation_messages", Number(variable?.get("conversationId"))], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, id, { ...newMessage.data, status: "sent" }, Number(variable?.get("conversationId")));
      });
    },
    onError: (error, variable) => {
      const id = Number(variable?.get("id"));
      const tempMessage = loadTempDataForMessage({ user, message: "", keyForRecipient: "", keyForSender: "", selectedConversation, status: "failed", id });
      queryClient.setQueryData(["get_conversation_messages", Number(variable?.get("conversationId"))], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, id, tempMessage, Number(variable?.get("conversationId")));
      });
      showError(error.message);
    },
  });

  const { isPending, mutate } = useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage, variable) => {
      setMessage("");
      queryClient.setQueryData(["get_conversation_messages", variable.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return replaceSendMessageInConversation(
          oldData,
          variable.id,
          (prev) => {
            const currentStatus = prev?.statuses?.[0]?.status;
            if (currentStatus === "delivered" || currentStatus === "seen") {
              return {
                ...newMessage.data,
                statuses: prev?.statuses
                  ? [
                      ...prev.statuses,
                    ]
                  : [],
                status: "sent",
              };
            }

            return {
              ...newMessage.data,
              status: "sent",
            };
          },
          variable.conversationId,
        );
      });
    },
    onError: (error, variable) => {
      setMessage("");
      const tempMessage = loadTempDataForMessage({ user, message: variable.content, keyForRecipient: variable.keyForRecipient, keyForSender: variable.keyForSender, selectedConversation, status: "failed", id: variable.id });
      queryClient.setQueryData(["get_conversation_messages", variable.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, variable.id, tempMessage, variable.conversationId);
      });
      showError(error.message);
    },
  });

  const { mutate: replyMessageFunc } = useMutation({
    mutationFn: replyToMessage,
    onSuccess: (newMessage, variable) => {
      setMessage("");
      queryClient.setQueryData(["get_conversation_messages", variable.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, variable.tempId ?? 0, { ...newMessage.data, status: "sent" }, variable.conversationId ?? 0);
      });
    },
    onError: (error, variable) => {
      setMessage("");
      const tempMessage = loadTempDataForMessage({ user, message: variable.content, keyForRecipient: variable.keyForRecipient, keyForSender: variable.keyForSender, selectedConversation, status: "failed", id: variable.tempId ?? 0 });
      queryClient.setQueryData(["get_conversation_messages", variable.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return replaceMessageInConversation(oldData, variable.tempId ?? 0, tempMessage, variable.conversationId ?? 0);
      });
      showError(error.message);
    },
  });

  const loadMoreMessage = () => {
    if (messageHasNextPage && !isMessageFetchNextPage) {
      messageNextPage();
    }
  };

  const handleSelectionMessage = (conv: Conversation) => {
    if (!selectedConversation) {
      setSelectedConversation({
        fullName: conv.name ?? "",
        avatar: conv.avatar,
        username: conv.username ?? "",
        id: conv.userId ?? 0,
        conversationId: conv.id,
        lastSeenAt: conv?.lastSeenAt,
        publicKey: conv?.publicKey,
      });

      if ((conv.unreadCount ?? 0) > 0 && conv?.lastMessage?.id) {
        readMessageFun({
          conversationId: conv.id,
          messageId: conv.lastMessage.id,
        });
      }
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeout)
      clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => setIsTyping(false), 3000));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage)
      return;

    const conversationId = selectedConversation?.conversationId ?? 0;
    const recipientPublicKey = selectedConversation?.publicKey;
    const senderPublicKey = user?.publicKey;

    if (!recipientPublicKey || !senderPublicKey)
      return;

    const [recipientKey, senderKey] = await Promise.all([
      importPublicKey(recipientPublicKey),
      importPublicKey(senderPublicKey),
    ]);

    const { content, keyForRecipient, keyForSender } = await encryptMessageForBothParties(
      trimmedMessage,
      senderKey,
      recipientKey,
    );

    const id = Date.now();

    if (isEditContent.enable && isEditContent.id) {
      editMessageFunc({
        id: isEditContent.id,
        content,
        keyForRecipient,
        keyForSender,
        conversationId,
        tempId: id,
      });

      setIsEditContent({ enable: false, id: null });
      setMessage("");
      return;
    }

    const tempMessage = loadTempDataForMessage({
      user,
      message: content,
      selectedConversation,
      keyForRecipient,
      keyForSender,
      status: "sending",
      id,
    });

    queryClient.setQueryData(
      ["get_conversation_messages", conversationId],
      (oldData: QueryOldDataPayloadConversation) =>
        addMessageConversation(oldData, tempMessage, conversationId),
    );

    if (reply) {
      replyMessageFunc({
        content,
        id: reply.id ?? 0,
        keyForRecipient,
        keyForSender,
        receiverId: reply.receiverId ?? 0,
        conversationId,
        tempId: id,
      });

      setReply(null);
    }
    else {
      mutate({
        conversationId,
        content,
        id,
        keyForRecipient,
        keyForSender,
      });
    }

    setMessage("");
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    setRecording(true);

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      setRecording(false);
      stream?.getTracks().forEach(track => track.stop());
      const blob = new Blob(chunks, { type: "audio/webm" });
      if (!blob)
        return;

      if (blob.size > 5 * 1024 * 1024) {
        showError("Audio is too large (max 5MB)");
        return;
      }

      const formData = new FormData();
      const tempId = Date.now();
      formData.append("media", blob);
      formData.append("id", String(tempId));
      formData.append("conversationId", String(selectedConversation?.conversationId));
      const tempMessage = loadTempDataForMessage({ user, message, keyForRecipient: "", keyForSender: "", selectedConversation, status: "sending", id: tempId, attachments: [blob] });
      queryClient.setQueryData(["get_conversation_messages", selectedConversation?.conversationId], (oldData: QueryOldDataPayloadConversation) => {
        return addMessageConversation(oldData, tempMessage, selectedConversation?.conversationId ?? 0);
      });
      sendAttachmentFun(formData);
    };
    mediaRecorder.start();
    setRecorder(mediaRecorder);
  };

  const stopRecording = () => {
    recorder?.stop();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    else {
      if (timerRef.current)
        clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current)
        clearInterval(timerRef.current);
    };
  }, [recording]);

  useEffect(() => {
    if (!socket)
      return;
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

  if (isError || isMessageError) {
    return (
      <div className="flex justify-center items-center h-[90vh] ">
        <ErrorMessage type="network" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-background h-[calc(100dvh-130px)] lg:h-[calc(100dvh-70px)]">
      <div className="flex-1 flex flex-col md:flex-row">
        <div className={cn(
          "w-full border-r border-border",
          "md:w-80 md:block",
          selectedConversation ? "hidden" : "block",
        )}
        >
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
          <div className=" lg:h-[calc(90vh-120px)] overflow-y-auto">
            <InfiniteScroll
              hasMore={hasNextPage}
              isLoading={isLoading}
              onLoadMore={loadMoreConversation}
            >
              <div>
                {isLoading
                  ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <ConversationSkeleton key={i} />
                      ))
                    )
                  : (
                      conversations?.length > 0
                        ? conversations.map(conv => (
                            <ConversationItem key={conv.id} conv={conv} onClick={() => handleSelectionMessage(conv)} />
                          ))
                        : (
                            <div className="text-center py-16 px-4 flex flex-col justify-center items-center rounded-lg">
                              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                              <h4 className="font-medium mb-2">No conversation yet</h4>
                              <p className="text-muted-foreground mb-4">
                                Start a new conversation to see it appear here
                              </p>
                            </div>
                          )
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

        {selectedConversation && !messageLoading
          ? (
              <div className="flex flex-col h-[90vh] w-full md:w-[calc(100%-20rem)]">
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

                <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]">
                  <div className="flex justify-center text-center items-center flex-col py-6">
                    <Avatar className="h-14 w-14">
                      {selectedConversation?.avatar
                        ? <AvatarImage src={selectedConversation?.avatar} alt={selectedConversation?.fullName} />
                        : <AvatarFallback>{selectedConversation?.fullName?.charAt(0)}</AvatarFallback>}
                    </Avatar>
                    <h4 className="mt-2 mb-3">{selectedConversation?.fullName}</h4>
                    <span className="text-xs text-gray-400">Messages and calls are secured with end-to-end encryption. Only people in this chat can read, listen to or share them.</span>
                  </div>
                  <InfiniteScroll
                    hasMore={messageHasNextPage}
                    isLoading={messageLoading}
                    onLoadMore={loadMoreMessage}
                  >
                    <div>
                      {messages?.length > 0
                        ? messages.map(message => (
                            <MessageItem key={message?.id} message={message} user={user} setReply={setReply} setMessage={setMessage} setIsEditContent={setIsEditContent} />
                          ))
                        : (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                              <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                              <p className="text-muted-foreground mb-4">
                                Send a message to start the conversation
                              </p>
                            </div>
                          )}
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
                  reply={reply}
                  setReply={setReply}
                />
              </div>
            )
          : (
              <div className="flex flex-1 items-center justify-center w-full">
                {
                  messageLoading
                    ? <Loader />
                    : (
                        <div className=" hidden md:flex justify-between items-center flex-col p-4">
                          <h3 className="font-medium">Select a conversation</h3>
                          <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations</p>
                        </div>
                      )
                }
              </div>
            )}
      </div>
      <CreateGroupDialog open={showCreateGroup} onOpenChange={setShowCreateGroup} />
    </div>
  );
}

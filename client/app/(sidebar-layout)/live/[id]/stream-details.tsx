"use client";

import type { RemoteParticipant } from "livekit-client";
import type React from "react";

import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { LiveKitRoom, TrackRefContext, useRoomContext, useTracks, VideoTrack } from "@livekit/components-react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Track } from "livekit-client";
import { Ban, Flag, MessageCircle, MoreHorizontal, Send, Share, Smile, Users, UserX, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ErrorMessage } from "@/components/api-error";
import { BanModal } from "@/components/ban-modal";
import FollowButton from "@/components/follow-button";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { MessageSkeleton } from "@/components/message-skeleton";
import { ReportModal } from "@/components/report-modal";
import CustomControlBar from "@/components/stream-controll";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import SocketEventEnum from "@/constants/socket-event";
import { useSocketStore } from "@/hooks/use-socket";
import { getStreamMessages, sendStreamMessage } from "@/lib/apis/stream";
import { loadTempDataForStreamChat } from "@/lib/temp-load-data";
import { showError } from "@/lib/toast";
import { addMessageConversationLiveStream, replaceMessageInConversationStream } from "@/lib/update-conversation";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";

function StreamUi({ stream, isHost, audioEl }: { stream: LiveStreamData; isHost: boolean; audioEl: React.RefObject<HTMLAudioElement | null> }) {
  const room = useRoomContext();
  const { socket } = useSocketStore();

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
    { source: Track.Source.Microphone, withPlaceholder: false },
  ]);

  const hostVideoTrack = tracks.find(track =>
    track.participant.identity === stream.user.id.toString()
    && track.source === Track.Source.Camera,
  );

  const hostScreenShareTrack = tracks.find(track =>
    track.participant.identity === stream.user.id.toString()
    && track.source === Track.Source.ScreenShare,
  );

  const hostAudioTrack = tracks.find(track =>
    track.participant.identity === stream.user.id.toString()
    && track.source === Track.Source.Microphone,
  );

  useEffect(() => {
    if (!room)
      return;

    const handleDisconnect = (participant: RemoteParticipant) => {
      if (Number(participant.identity) === stream?.userId) {
        socket?.emit(SocketEventEnum.HOST_LEFT_LIVE_STREAM, {
          streamId: stream.id,
          username: stream?.user?.username,
        });
      }
    };

    const handleConnect = (participant: RemoteParticipant) => {
      if (Number(participant.identity) === stream?.userId) {
        socket?.emit(SocketEventEnum.HOST_JOIN_LIVE_STREAM, {
          streamId: stream.id,
          username: stream?.user?.username,
        });
      }
    };

    room.on("participantConnected", handleConnect);
    room.on("participantDisconnected", handleDisconnect);

    return () => {
      room.off("participantConnected", handleConnect);
      room.off("participantDisconnected", handleDisconnect);
    };
  }, [room, stream]);

  useEffect(() => {
    if (!hostAudioTrack || !audioEl.current)
      return;

    const publication = hostAudioTrack.publication;
    if (publication?.track) {
      publication.track.attach(audioEl.current);
      audioEl.current.volume = 1;
    }

    return () => {
      if (publication?.track) {
        publication.track.detach();
      }
    };
  }, [hostAudioTrack]);

  return (
    <>
      {hostScreenShareTrack
        ? (
            <TrackRefContext.Provider value={hostScreenShareTrack}>
              <VideoTrack className="w-full h-full object-contain" />
            </TrackRefContext.Provider>
          )
        : hostVideoTrack
          ? (
              <TrackRefContext.Provider value={hostVideoTrack}>
                <VideoTrack className="w-full h-full object-cover" />
              </TrackRefContext.Provider>
            )
          : (
              <div className="flex flex-col items-center justify-center py-8 w-full bg-background text-center px-4">
                <div className="animate-pulse">
                  <div className="rounded-full bg-red-500/10 border border-red-500/30 w-20 h-20 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-red-500 animate-ping" />
                  </div>
                </div>

                <h1 className="text-2xl font-semibold mt-6">
                  {isHost ? "Connecting to Stream..." : "Waiting for Host Video"}
                </h1>
                <p className="text-muted-foreground mt-2 max-w-md">
                  {
                    isHost ? "Hang tight! We're connecting you to the stream." : "The host hasn't started streaming yet. As soon as the video starts, it will appear here."
                  }
                </p>

                {
                  !isHost && <div className="mt-6 text-sm text-muted-foreground italic">Powered by Ummah Connect</div>
                }
              </div>
            )}

      <audio
        ref={audioEl}
        autoPlay
        playsInline
        className="hidden"
      />
    </>
  );
}

function ParticipantCount({ streamId }: { streamId: number }) {
  const room = useRoomContext();
  const [participantCount, setParticipantCount] = useState(0);
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!room)
      return;

    const updateParticipantCount = () => {
      const count = room.numParticipants;
      setParticipantCount(count);
      socket?.emit(SocketEventEnum.LIVE_VIEW_COUNT, { streamId, count });
    };

    room.on("participantConnected", updateParticipantCount);
    room.on("participantDisconnected", updateParticipantCount);
    room.on("connected", updateParticipantCount);

    updateParticipantCount();

    return () => {
      room.off("participantConnected", updateParticipantCount);
      room.off("participantDisconnected", updateParticipantCount);
      room.off("connected", updateParticipantCount);
    };
  }, [room]);

  return participantCount;
}

export default function LiveStreamPage({ id, stream, token, livekitUrl }: { id: string; stream: LiveStreamData; token: string; livekitUrl: string }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const { theme } = useTheme();
  const [muted, setMuted] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useStore();
  const { socket } = useSocketStore();
  const isHost = user?.id === stream?.userId;
  const audioEl = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [isBan, setIsBan] = useState(false);
  const [banUser, setBanUser] = useState({
    userId: 0,
    username: "",
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<LiveStreamChatsResponse>({
    queryKey: ["get_stream_messages"],
    queryFn: ({ pageParam = 1 }) => getStreamMessages({ page: Number(pageParam), streamId: Number(id) }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
      return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: id ? stream.enableChat : false,
  });
  const messages = useMemo(() => {
    return data?.pages.flatMap(page => page?.data?.messages) ?? [];
  }, [data]);

  const loadMoreMessages = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const { isPending, mutate } = useMutation({
    mutationFn: sendStreamMessage,
    onSuccess: (data, variable) => {
      const payload = data?.data;
      queryClient.setQueryData(["get_stream_messages"], (oldData: QueryOldDataPayloadLiveStreamChats) => {
        return replaceMessageInConversationStream(oldData, variable.id, { ...payload, status: "sent" }, payload?.streamId);
      });
    },
    onError: (error, variable) => {
      showError(error?.message);
      const payload = loadTempDataForStreamChat(user, variable.content, stream.id, variable.id);
      queryClient.setQueryData(["get_stream_messages"], (oldData: QueryOldDataPayloadLiveStreamChats) => {
        return replaceMessageInConversationStream(oldData, variable.id, { ...payload, status: "failed" }, payload?.streamId);
      });
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast.success("Link copied!", {
          description: "Share this link with others",
        });
      });
  };

  const toggleMute = () => {
    if (audioEl.current) {
      audioEl.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const id = Date.now();
      const tempMessage = loadTempDataForStreamChat(user, chatMessage?.trim(), stream.id, id);
      queryClient.setQueryData(["get_stream_messages"], (oldData: QueryOldDataPayloadLiveStreamChats) => {
        return addMessageConversationLiveStream(oldData, tempMessage, stream.id);
      });
      mutate({ senderId: user?.id ?? 0, streamId: stream.id, content: chatMessage?.trim(), id });
      setChatMessage("");
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket)
      return;
    socket.emit(SocketEventEnum.JOIN_LIVE_STREAM, id?.toString());
    return () => {
      socket.off(SocketEventEnum.JOIN_LIVE_STREAM);
    };
  }, [socket, id]);

  if (isError) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ErrorMessage type="network" />
      </div>
    );
  }

  return (
    <LiveKitRoom
      connect={true}
      video={isHost}
      audio={isHost}
      serverUrl={livekitUrl}
      token={token}
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 md:max-w-[65%]">
          <div className="relative bg-black">
            <StreamUi stream={stream} isHost={isHost} audioEl={audioEl} />
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
            <div className="absolute w-full left-0 bottom-2 m-auto flex justify-between items-center">
              {
                !isHost && (
                  <div className="flex ml-2 gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={toggleMute}
                    >
                      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </div>
                )
              }
              {
                isHost && <CustomControlBar stream={stream} streamId={stream.id} />
              }
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <Users className="h-4 w-4 mr-1" />
                  <ParticipantCount streamId={stream.id} />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h1 className="text-xl font-bold">{stream?.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  {stream?.user?.avatar
                    ? <AvatarImage src={stream?.user?.avatar} alt={stream?.user?.fullName} />
                    : <AvatarFallback>{stream?.user?.fullName?.charAt(0)}</AvatarFallback>}
                </Avatar>
                <div className="mr-2">
                  <div className="font-medium">{stream?.user?.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {stream?.user?.followerCount}
                    {" "}
                    followers
                  </div>
                </div>
                {
                  !isHost && <FollowButton isFollowing={stream?.user?.isFollowing} id={stream?.userId} />
                }
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="icon">
                  <Share className="h-5 w-5" />
                </Button>
                {
                  !isHost && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-20" align="start">
                        <DropdownMenuItem onClick={() => setShowReportModal(!showReportModal)} className="cursor-pointer">
                          Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{stream?.category}</Badge>
                {stream?.tags?.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm">{stream?.description}</p>
            </div>
          </div>
        </div>

        <div className="md:w-[35%] h-[500px]">
          {!stream?.enableChat
            ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full p-6">
                  <Ban className="h-10 w-10 mb-3 text-gray-400" />
                  <p className="text-sm font-medium">Chat is disabled</p>
                  <p className="text-xs text-muted-foreground">The host has disabled chat for this stream</p>
                </div>
              )
            : (
                <div className="border-t md:border-t-0 md:border-l border-border flex flex-col h-[500px] md:h-auto">
                  <div className="p-3 border-b border-border">
                    <h2 className="font-medium">Live Chat</h2>
                  </div>
                  <InfiniteScroll
                    hasMore={hasNextPage}
                    isLoading={isLoading}
                    onLoadMore={loadMoreMessages}
                  >
                    <ScrollArea className="p-3 h-[500px]">
                      <div className="space-y-4">
                        {isLoading
                          ? (
                              <MessageSkeleton />
                            )
                          : (
                              messages?.length > 0
                                ? messages?.map(message => (
                                    <div key={message?.id} className={cn("flex gap-2 group relative", { "opacity-70": message?.status === "sending" || message?.status === "failed" })}>
                                      <Avatar className="h-6 w-6">
                                        {message?.sender?.avatar
                                          ? <AvatarImage src={message?.sender?.avatar} alt={message?.sender?.fullName} />
                                          : <AvatarFallback>{message?.sender?.fullName?.charAt(0)}</AvatarFallback>}
                                      </Avatar>

                                      <div className="-mt-1 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{message?.sender?.fullName}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(message?.createdAt ?? ""))}
                                          </span>
                                        </div>
                                        <p className="text-sm">{message?.content}</p>
                                      </div>

                                      {message?.senderId !== stream.userId && (
                                        <div className="absolute right-0 top-0">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 hover:bg-muted"
                                              >
                                                <MoreHorizontal className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  if (message?.senderId === stream.userId)
                                                    return;
                                                  setShowReportModal(true);
                                                }}
                                                className="text-sm"
                                                disabled={message?.senderId === stream.userId}
                                              >
                                                <Flag className="h-4 w-4 mr-2" />
                                                Report Message
                                              </DropdownMenuItem>

                                              {isHost && (
                                                <DropdownMenuItem
                                                  onClick={() => {
                                                    if (message?.senderId === stream.userId)
                                                      return;
                                                    setBanUser({
                                                      userId: message?.senderId ?? 0,
                                                      username: message?.sender?.fullName ?? "",
                                                    });
                                                    setIsBan(true);
                                                  }}
                                                  className="text-sm text-red-600"
                                                  disabled={message?.senderId === stream.userId}
                                                >
                                                  <UserX className="h-4 w-4 mr-2" />
                                                  Ban from Live
                                                </DropdownMenuItem>
                                              )}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      )}
                                      {message?.status === "failed" && (
                                        <span className="text-xs text-red-500">Failed to send</span>
                                      )}
                                      {message?.status === "sending" && (
                                        <span className="text-xs text-gray-300">sending..</span>
                                      )}
                                    </div>
                                  ))
                                : (
                                    <div className="text-center py-16 px-4 flex flex-col justify-center items-center rounded-lg">
                                      <MessageCircle className="h-10 w-10 mb-3 text-gray-400" />
                                      <p className="text-sm font-medium">No messages yet</p>
                                      <p className="text-xs text-muted-foreground">Be the first to start the conversation</p>
                                    </div>
                                  )
                            )}

                        {isFetchingNextPage && (
                          <>
                            <MessageSkeleton />
                            <MessageSkeleton />
                          </>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>
                  </InfiniteScroll>

                  <div className="p-3 relative border-t border-border">
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-14 left-2 z-10">
                        <Picker
                          data={emojiData}
                          onEmojiSelect={(emoji: EmojiPicker) => setChatMessage(prev => prev + emoji.native)}
                          theme={theme}
                          previewPosition="none"
                          searchPosition="none"
                        />
                      </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} type="button" variant="ghost" size="icon" className="shrink-0">
                        <Smile className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Send a message..."
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!chatMessage.trim() || isPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}
        </div>
      </div>
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        id={3}
      />
      <BanModal isOpen={isBan} onClose={() => setIsBan(false)} userId={banUser?.userId} streamId={stream.id} username={banUser?.username} />
    </LiveKitRoom>
  );
}

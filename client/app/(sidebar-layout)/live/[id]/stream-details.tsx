"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VolumeX, Volume2, Users, Share, Heart, MoreHorizontal, Send, MessageCircle, Ban, UserX, Flag, Smile } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReportModal } from "@/components/report-modal"
import { toast } from "sonner"
import { LiveKitRoom, TrackRefContext, useRoomContext, useTracks, VideoTrack } from "@livekit/components-react"
import { useAuthStore } from "@/store/store"
import { RemoteParticipant, Track } from "livekit-client"
import CustomControlBar from "@/components/stream-controll"
import { useSocketStore } from "@/hooks/use-socket"
import SocketEventEnum from "@/constants/socket-event"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get_stream_messages, report_user, send_stream_message } from "@/lib/apis/stream"
import { ErrorMessage } from "@/components/api-error"
import { formatDistanceToNow } from 'date-fns';
import { InfiniteScroll } from "@/components/infinite-scroll"
import { MessageSkeleton } from "@/components/message-skeleton"
import { addMessageConversationLiveStream } from "@/lib/update-conversation"
import FollowButton from "@/components/follow-button"
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes"
import { BanModal } from "@/components/ban-modal"


function StreamUi({ stream, isHost, audioEl }: { stream: LiveStreamData, isHost: boolean, audioEl: React.RefObject<HTMLAudioElement | null> }) {

    const room = useRoomContext()
    const { socket } = useSocketStore()

    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
        { source: Track.Source.Microphone, withPlaceholder: false }
    ]);

    const hostVideoTrack = tracks.find(track =>
        track.participant.identity === stream.user.id.toString() &&
        track.source === Track.Source.Camera
    );

    const hostScreenShareTrack = tracks.find(track =>
        track.participant.identity === stream.user.id.toString() &&
        track.source === Track.Source.ScreenShare
    );

    const hostAudioTrack = tracks.find(track =>
        track.participant.identity === stream.user.id.toString() &&
        track.source === Track.Source.Microphone
    );

    useEffect(() => {
        if (!room) return;

        const handleDisconnect = (participant: RemoteParticipant) => {
            if (Number(participant.identity) === stream?.user_id) {
                socket?.emit(SocketEventEnum.HOST_LEFT_LIVE_STREAM, {
                    streamId: stream.id,
                    username: stream?.user?.username,
                });
            }
        };

        const handleConnect = (participant: RemoteParticipant) => {
            if (Number(participant.identity) === stream?.user_id) {
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
        if (!hostAudioTrack || !audioEl.current) return;

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
            {hostScreenShareTrack ? (
                <TrackRefContext.Provider value={hostScreenShareTrack}>
                    <VideoTrack className="w-full h-full object-contain" />
                </TrackRefContext.Provider>
            ) : hostVideoTrack ? (
                <TrackRefContext.Provider value={hostVideoTrack}>
                    <VideoTrack className="w-full h-full object-cover" />
                </TrackRefContext.Provider>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 w-full bg-background text-center px-4">
                    <div className="animate-pulse">
                        <div className="rounded-full bg-red-500/10 border border-red-500/30 w-20 h-20 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-red-500 animate-ping" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold mt-6">
                        {isHost ? 'Connecting to Stream...' : 'Waiting for Host Video'}
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
    )
}

function ParticipantCount({ streamId }: { streamId: number }) {
    const room = useRoomContext()
    const [participantCount, setParticipantCount] = useState(0);
    const { socket } = useSocketStore()

    useEffect(() => {
        if (!room) return;

        const updateParticipantCount = () => {
            const count = room.numParticipants;
            setParticipantCount(count);
            socket?.emit(SocketEventEnum.LIVE_VIEW_COUNT, { streamId, count })
        };

        room.on('participantConnected', updateParticipantCount);
        room.on('participantDisconnected', updateParticipantCount);
        room.on('connected', updateParticipantCount);

        updateParticipantCount();

        return () => {
            room.off('participantConnected', updateParticipantCount);
            room.off('participantDisconnected', updateParticipantCount);
            room.off('connected', updateParticipantCount);
        };
    }, [room]);

    return participantCount
}

export default function LiveStreamPage({ id, stream, token, livekitUrl }: { id: string, stream: LiveStreamData, token: string, livekitUrl: string }) {
    const [showReportModal, setShowReportModal] = useState(false);
    const { theme } = useTheme()
    const [muted, setMuted] = useState(false)
    const [liked, setLiked] = useState(false)
    const [chatMessage, setChatMessage] = useState("")
    const [likes, setLikes] = useState(0)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const { user } = useAuthStore()
    const { socket } = useSocketStore()
    const isHost = user?.id === stream?.user_id
    const audioEl = useRef<HTMLAudioElement>(null);
    const queryClient = useQueryClient()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [type, setType] = useState('spamming')
    const [reportedId, setReportedId] = useState<number | null>(null)
    const [isBan, setIsBan] = useState(false)
    const [banUser, setBanUser] = useState({
        userId: 0,
        username: ''
    })
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<LiveStreamChatsResponse>({
        queryKey: ['get_stream_messages'],
        queryFn: ({ pageParam = 1 }) => get_stream_messages({ page: Number(pageParam), streamId: Number(id) }),
        getNextPageParam: (lastPage) => {
            const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
            return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
        enabled: id ? stream.enable_chat : false
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
        mutationFn: send_stream_message,
        onSuccess: (data) => {
            const payload = data?.data
            queryClient.setQueryData(['get_stream_messages'], (oldData: QueryOldDataPayloadLiveStreamChats) => {
                return addMessageConversationLiveStream(oldData, payload, payload?.stream_id)
            })
        },
        onError: (error) => {
            toast.error(error?.message)
        }
    })

    const { isPending: reportSubmitLoading, mutate: reportMuFunc } = useMutation({
        mutationFn: report_user,
        onSuccess: () => {
            setShowReportModal(false)
            toast.success('Report submitted')
        },
        onError: (error) => {
            console.log(error)
            toast.error(error?.message)
        }
    })


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
    }

    const toggleLike = () => {
        setLiked(!liked)
        setLikes(liked ? likes - 1 : likes + 1)
    }

    const handleReportSubmit = (description: string, images: File[]) => {
        if(!reportedId) return
        const formData = new FormData()
        formData.append("stream_id", id)
        formData.append("type", type)
        formData.append("reported_id", String(reportedId))
        formData.append('reason', description)
        for (const file of images) {
            formData.append("attachments", file);
        }
        reportMuFunc(formData)
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (chatMessage.trim()) {
            mutate({ sender_id: user?.id ?? 0, stream_id: stream.id, content: chatMessage?.trim() })
            setChatMessage("")
            setShowEmojiPicker(false)
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        if (!socket) return;
        socket.emit(SocketEventEnum.JOIN_LIVE_STREAM, id?.toString());
        return () => {
            socket.off(SocketEventEnum.JOIN_LIVE_STREAM);
        };
    }, [socket, id]);

    if (isError) {
        return <div className="flex justify-center items-center mt-10">
            <ErrorMessage type='network' />
        </div>
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
                                !isHost && <div className="flex ml-2 gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full bg-black/50 text-white hover:bg-black/70"
                                        onClick={toggleMute}
                                    >
                                        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                </div>
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
                                    <AvatarImage src={stream?.user?.avatar || "/placeholder.svg"} alt={stream?.user?.full_name} />
                                    <AvatarFallback>{stream?.user?.full_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="mr-2">
                                    <div className="font-medium">{stream?.user?.full_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {stream?.user?.followerCount} followers
                                    </div>
                                </div>
                                {
                                    !isHost && <FollowButton isFollowing={stream?.user?.isFollowing} id={stream?.user_id} />
                                }
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className={liked ? "text-red-500" : ""} onClick={toggleLike}>
                                    <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
                                </Button>
                                <Button onClick={handleCopy} variant="outline" size="icon">
                                    <Share className="h-5 w-5" />
                                </Button>
                                {
                                    !isHost && <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-20" align="start">
                                            <DropdownMenuItem onClick={() => {
                                                setShowReportModal(!showReportModal)
                                                setType('stream')
                                            }} className="cursor-pointer">
                                                Report
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                }
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary">{stream?.category}</Badge>
                                {stream?.tags?.map((tag) => (
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
                    {!stream?.enable_chat ? <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full p-6">
                        <Ban className="h-10 w-10 mb-3 text-gray-400" />
                        <p className="text-sm font-medium">Chat is disabled</p>
                        <p className="text-xs text-muted-foreground">The host has disabled chat for this stream</p>
                    </div> : <div className="border-t md:border-t-0 md:border-l border-border flex flex-col h-[500px] md:h-auto">
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
                                    {isLoading ? (
                                        <MessageSkeleton />
                                    ) : (
                                        messages?.length > 0 ? messages?.map((message) => (
                                            <div key={message?.id} className="flex gap-2 group relative">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={message?.sender?.avatar || "/placeholder.svg"} alt={message?.sender?.full_name} />
                                                    <AvatarFallback>{message?.sender?.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>

                                                <div className="-mt-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{message?.sender?.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(message?.createdAt ?? ''))}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{message?.content}</p>
                                                </div>

                                                {message?.sender_id !== stream.user_id && <div className="absolute right-0 top-0">
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
                                                                    if(message?.sender_id === stream.user_id) return
                                                                    setShowReportModal(true)
                                                                    setReportedId(message?.sender_id ?? 0)
                                                                }}
                                                                className="text-sm"
                                                                disabled={message?.sender_id === stream.user_id}
                                                            >
                                                                <Flag className="h-4 w-4 mr-2" />
                                                                Report Message
                                                            </DropdownMenuItem>

                                                            {isHost && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        if(message?.sender_id === stream.user_id) return
                                                                        setBanUser({
                                                                            userId: message?.sender_id ?? 0,
                                                                            username: message?.sender?.full_name ?? ''
                                                                        })
                                                                        setIsBan(true)
                                                                    }}
                                                                    className="text-sm text-red-600"
                                                                    disabled={message?.sender_id === stream.user_id}
                                                                >
                                                                    <UserX className="h-4 w-4 mr-2" />
                                                                    Ban from Live
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>}
                                            </div>
                                        )) : <div className="text-center py-16 px-4 flex flex-col justify-center items-center rounded-lg">
                                            <MessageCircle className="h-10 w-10 mb-3 text-gray-400" />
                                            <p className="text-sm font-medium">No messages yet</p>
                                            <p className="text-xs text-muted-foreground">Be the first to start the conversation</p>
                                        </div>
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
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={!chatMessage.trim() || isPending}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>}
                </div>
            </div>
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReportSubmit}
                isLoading={reportSubmitLoading}
            />
            <BanModal isOpen={isBan} onClose={() => setIsBan(false)} userId={banUser?.userId} streamId={stream.id} username={banUser?.username} />
        </LiveKitRoom>
    )
}

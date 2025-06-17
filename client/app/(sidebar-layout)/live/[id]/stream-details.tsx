"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VolumeX, Volume2, Users, Share, Heart, MoreHorizontal, Send } from "lucide-react"
import { useRouter } from "next/navigation"
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



const initialChatMessages = [
    {
        id: "1",
        user: {
            name: "Ibrahim Khan",
            username: "ibrahim_k",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        message: "Assalamu alaikum! Excited for this session!",
        timestamp: "2 minutes ago",
    },
    {
        id: "2",
        user: {
            name: "Aisha Rahman",
            username: "aisha_r",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        message: "Can you explain the difference between conventional and Islamic banking?",
        timestamp: "1 minute ago",
    },
    {
        id: "3",
        user: {
            name: "Omar Farooq",
            username: "omar_f",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        message: "JazakAllah khair for doing this stream! Very informative.",
        timestamp: "Just now",
    },
]

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

function ParticipantCount({ streamId }: {streamId:number}) {
    const room = useRoomContext()
    const [participantCount, setParticipantCount] = useState(0);
    const { socket } = useSocketStore()

    useEffect(() => {
        if (!room) return;

        const updateParticipantCount = () => {
            const count = room.numParticipants;
            setParticipantCount(count);
            socket?.emit(SocketEventEnum.LIVE_VIEW_COUNT, { streamId, count})
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
    const router = useRouter()
    const [showReportModal, setShowReportModal] = useState(false);
    const [muted, setMuted] = useState(false)
    const [liked, setLiked] = useState(false)
    const [chatMessage, setChatMessage] = useState("")
    const [chatMessages, setChatMessages] = useState(initialChatMessages)
    const [likes, setLikes] = useState(0)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const { user } = useAuthStore()
    const { socket } = useSocketStore()
    const isHost = user?.id === stream?.user_id
    const audioEl = useRef<HTMLAudioElement>(null);




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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (chatMessage.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                user: {
                    name: "You",
                    username: "current_user",
                    avatar: "/placeholder.svg?height=32&width=32",
                },
                message: chatMessage,
                timestamp: "Just now",
            }
            setChatMessages([...chatMessages, newMessage])
            setChatMessage("")
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chatMessages])

    useEffect(() => {
        if (!socket) return;
        socket.emit(SocketEventEnum.JOIN_LIVE_STREAM, id?.toString());
        return () => {
            socket.off(SocketEventEnum.JOIN_LIVE_STREAM);
        };
    }, [socket, id]);

    return (
        <LiveKitRoom
            connect={true}
            video={isHost}
            audio={isHost}
            serverUrl={livekitUrl}
            token={token}
        >
            <div className="flex-1 w-full">
                <div className="relative bg-black">
                    <StreamUi stream={stream} isHost={isHost} audioEl={audioEl} />
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                    <div className="absolute w-full bottom-4 m-auto flex justify-between items-center">
                        {
                            !isHost && <div className="flex gap-2">
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
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full bg-black/50 text-white hover:bg-black/70 px-3"
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
                            <div>
                                <div className="font-medium">{stream?.user?.full_name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {stream?.user?.followerCount} followers
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" className="ml-2">
                                Follow
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className={liked ? "text-red-500" : ""} onClick={toggleLike}>
                                <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
                            </Button>
                            <Button onClick={handleCopy} variant="outline" size="icon">
                                <Share className="h-5 w-5" />
                            </Button>
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

            {/* Chat section */}
            <div className="border-t md:border-t-0 md:border-l border-border flex flex-col h-[500px] md:h-auto">
                <div className="p-3 border-b border-border">
                    <h2 className="font-medium">Live Chat</h2>
                </div>
                <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                        {chatMessages.map((message) => (
                            <div key={message.id} className="flex gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.name} />
                                    <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{message.user.name}</span>
                                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                    </div>
                                    <p className="text-sm">{message.message}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </ScrollArea>
                <div className="p-3 border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            placeholder="Send a message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!chatMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={() => console.log('report submit')}
            />
        </LiveKitRoom>
    )
}

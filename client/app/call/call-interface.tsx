"use client"
import { useEffect } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    ControlBar,
    GridLayout,
    ParticipantTile,
    useTracks,
    useRoomContext
} from '@livekit/components-react';
import '@livekit/components-styles';
import { RoomEvent, Track } from 'livekit-client';
import { useCallStore, useCallActions } from '@/hooks/use-call-store';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/store';
import { useSocketStore } from '@/hooks/use-socket';
import SocketEventEnum from '@/constants/socket-event';

function MyVideoConferenceLayout() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    return (
        <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
            <ParticipantTile />
        </GridLayout>
    );
}

function RoomEventHandler({ onLeave }: { onLeave: () => void }) {
    const room = useRoomContext();

    useEffect(() => {
        const handleDisconnected = () => {
            onLeave();
        };
        
        room.on(RoomEvent.Disconnected, handleDisconnected);

        return () => {
            room.off(RoomEvent.Disconnected, handleDisconnected);
        };
    }, [room, onLeave]);

    return null;
}


export default function CallInterface({ roomName, callType }: { roomName: string, callType: string }) {
    const router = useRouter();
    const { socket } = useSocketStore()

    const { token, livekitUrl, isFetchingToken } = useCallStore();
    const { fetchToken, endCall } = useCallActions();
    const { user } = useAuthStore()

    useEffect(() => {
        if (typeof roomName !== 'string' || (callType !== 'audio' && callType !== 'video')) {
            router.push('/');
            return;
        }

        if (!token && user) {
            fetchToken(roomName, user.full_name ?? `user-${Date.now()}`, callType);
        }
    }, [roomName, callType, token, fetchToken, router, user]);

    const handleLeave = () => {
        socket?.emit(SocketEventEnum.CALLER_LEFT, { roomName, userId: user?.id, callerAvatar: user?.avatar, callerName: user?.full_name });
        endCall();
        router.push('/');
    };


    if (isFetchingToken || !token || !livekitUrl) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Getting ready...</div>;
    }

    return (
        <LiveKitRoom
            video={callType === 'video'}
            audio={true}
            token={token}
            serverUrl={livekitUrl}
            data-lk-theme="default"
            style={{ height: '100dvh' }}
        >
            <RoomEventHandler onLeave={handleLeave} />
            <MyVideoConferenceLayout />
            <RoomAudioRenderer />
            <ControlBar />
        </LiveKitRoom>
    );
}
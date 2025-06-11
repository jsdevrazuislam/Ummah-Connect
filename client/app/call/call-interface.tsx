"use client"
import { useEffect } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    ControlBar,
    GridLayout,
    ParticipantTile,
    useTracks
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useCallStore, useCallActions } from '@/hooks/use-call-store';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/store';

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


export default function CallInterface({ roomName, callType }: { roomName: string, callType: string }) {
    const router = useRouter();

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

    const handleDisconnect = () => {
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
            onDisconnected={handleDisconnect}
        >
            <MyVideoConferenceLayout />
            <RoomAudioRenderer />
            <ControlBar />
        </LiveKitRoom>
    );
}
import {
    TrackToggle,
    usePersistentUserChoices,
    useRoomContext,
    useTracks,
} from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';
import { Mic, MicOff, ScreenShare, ScreenShareOff, Video, VideoOff } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { EndStreamConfirmation } from "@/components/live-end-modal"
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { end_live } from '@/lib/apis/stream';



const CustomControlBar = ({ streamId, stream }: { streamId: number, stream: LiveStreamData }) => {
    const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
    const room = useRoomContext()
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
        { source: Track.Source.Microphone, withPlaceholder: false }
    ]);

    const hostVideoTrack = tracks.find(track =>
        track.participant.identity === stream.user.id.toString() &&
        track.source === Track.Source.Camera
    );

    const hostAudioTrack = tracks.find(track =>
        track.participant.identity === stream.user.id.toString() &&
        track.source === Track.Source.Microphone
    );

    const { isPending, mutate } = useMutation({
        mutationFn: end_live,
        onSuccess: async () => {
            await room.disconnect()
            router.push('/')
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const router = useRouter()

    const {
        saveAudioInputEnabled,
        saveVideoInputEnabled,
        saveAudioInputDeviceId,
        saveVideoInputDeviceId,
    } = usePersistentUserChoices({ preventSave: false });

    const microphoneOnChange = useCallback(
        (enabled: boolean, isUserInitiated: boolean) => {
            setIsMicrophoneEnabled(enabled);
            if (isUserInitiated) {
                saveAudioInputEnabled(enabled);
            }
        },
        [saveAudioInputEnabled],
    );

    const cameraOnChange = useCallback(
        (enabled: boolean, isUserInitiated: boolean) => {
            setIsCameraEnabled(enabled);
            if (isUserInitiated) {
                saveVideoInputEnabled(enabled);
            }
        },
        [saveVideoInputEnabled],
    );

    const onScreenShareChange = useCallback(
        (enabled: boolean) => {
            setIsScreenShareEnabled(enabled);
        },
        [],
    );

    const handleLiveEnd = async () => {
        mutate(streamId)
    }

    return (
        (hostVideoTrack && hostAudioTrack) && room.state !== ConnectionState.Disconnected && <div className='relative w-full flex justify-center items-center m-auto'>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                <div className="bg-black/70 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
                    <TrackToggle
                        source={Track.Source.Microphone}
                        showIcon={false}
                        onChange={microphoneOnChange}
                        className={`p-2 rounded-full ${!isMicrophoneEnabled ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isMicrophoneEnabled ? (
                            <Mic className="h-5 w-5 text-white" />
                        ) : (
                            <MicOff className="h-5 w-5 text-white" />
                        )}
                    </TrackToggle>

                    <TrackToggle
                        source={Track.Source.Camera}
                        showIcon={false}
                        onChange={cameraOnChange}
                        className={`p-2 rounded-full ${!isCameraEnabled ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isCameraEnabled ? (
                            <Video className="h-5 w-5 text-white" />
                        ) : (
                            <VideoOff className="h-5 w-5 text-white" />
                        )}
                    </TrackToggle>

                    <TrackToggle
                        source={Track.Source.ScreenShare}
                        captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
                        showIcon={false}
                        onChange={onScreenShareChange}
                        className={`p-2 rounded-full ${!isScreenShareEnabled ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {isScreenShareEnabled ? (
                            <ScreenShareOff className="h-5 w-5 text-white" />
                        ) : (
                            <ScreenShare className="h-5 w-5 text-white" />
                        )}
                    </TrackToggle>
                    <EndStreamConfirmation onConfirm={handleLiveEnd} isLoading={isPending} />
                </div>
            </div>
        </div>
    );
};

export default CustomControlBar;
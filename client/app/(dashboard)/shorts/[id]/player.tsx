"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import Hls from 'hls.js';
import api from '@/lib/apis/api';


export interface VideoPlayerHandle {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    toggleMute: () => void;
    isPlaying: () => boolean;
}
interface VideoPlayerProps {
    publicId: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    onReady?: () => void;
    onLoadedMetadata?: (duration: number) => void;
    onTimeUpdate?: (currentTime: number) => void;
}

const ControlledVideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
    ({ publicId, autoPlay = false, muted = false, loop = false, onReady, onLoadedMetadata, onTimeUpdate }, ref) => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const [hlsUrl, setHlsUrl] = useState<string | null>(null);

        useImperativeHandle(ref, () => ({
            play: () => videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            seekTo: (s: number) => {
                if (videoRef.current) videoRef.current.currentTime = s;
            },
            toggleMute: () => {
                if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
            },
            isPlaying: () => !!(videoRef.current && !videoRef.current.paused),
        }));

        useEffect(() => {
            const fetchVideoUrl = async () => {
                try {
                    const { data } = await api.get(`/stream/url/${encodeURIComponent(publicId)}`);
                    setHlsUrl(data?.hlsUrl);
                } catch (error) {
                    console.error("Failed to get video URL", error);
                }
            };
            fetchVideoUrl();
        }, [publicId]);

        useEffect(() => {
            if (!hlsUrl || !videoRef.current) return;

            const video = videoRef.current;

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(hlsUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (autoPlay) video.play().catch(() => { });
                    onReady?.();
                });

                return () => hls.destroy();
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
                video.addEventListener('loadedmetadata', () => {
                    if (autoPlay) video.play().catch(() => { });
                    onReady?.();
                });
            }
        }, [hlsUrl]);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            const handleMetadata = () => onLoadedMetadata?.(video.duration);
            const handleTime = () => onTimeUpdate?.(video.currentTime);

            video.addEventListener('loadedmetadata', handleMetadata);
            video.addEventListener('timeupdate', handleTime);

            return () => {
                video.removeEventListener('loadedmetadata', handleMetadata);
                video.removeEventListener('timeupdate', handleTime);
            };
        }, [onLoadedMetadata, onTimeUpdate]);

        return (
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted={muted}
                loop={loop}
                playsInline
                controls={false}
            />
        );
    }
);


export default ControlledVideoPlayer;

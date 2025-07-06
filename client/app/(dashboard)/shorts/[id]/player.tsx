"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import Hls from 'hls.js';


export interface VideoPlayerHandle {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    toggleMute: () => void;
    isPlaying: () => boolean;
}
interface VideoPlayerProps {
    videoUrl: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    onReady?: () => void;
    onLoadedMetadata?: (duration: number) => void;
    onTimeUpdate?: (currentTime: number) => void;
}

const ControlledVideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
    ({ videoUrl, autoPlay = false, muted = false, loop = false, onReady, onLoadedMetadata, onTimeUpdate }, ref) => {
        const videoRef = useRef<HTMLVideoElement>(null);

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
            if (!videoUrl || !videoRef.current) return;

            const video = videoRef.current;

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    const duration = video.duration || hls.media?.duration || 0;
                    onLoadedMetadata?.(duration);

                    if (autoPlay) {
                        video.play().catch(() => { });
                    }

                    onReady?.();
                });

                return () => hls.destroy();
            }
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                video.addEventListener('loadedmetadata', () => {
                    if (autoPlay) video.play().catch(() => { });
                    onReady?.();
                });
            }
        }, [videoUrl]);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            const handleMetadata = () => {
                const duration = video.duration || 0;
                onLoadedMetadata?.(duration);
            };
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
                onContextMenu={(e) => e.preventDefault()}
            />
        );
    }
);


export default ControlledVideoPlayer;

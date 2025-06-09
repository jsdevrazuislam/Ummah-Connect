"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface MessageVideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

export function MessageVideoPlayer({ src, poster, className }: MessageVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout>();

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentProgress =
                (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            const seekTime = (value[0] / 100) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0] / 100;
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
            if (!isMuted) {
                setVolume(0);
            } else {
                setVolume(1);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);
        const timeout = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
        setControlsTimeout(timeout);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        return () => {
            if (controlsTimeout) clearTimeout(controlsTimeout);
        };
    }, [controlsTimeout]);

    return (
        <div
            ref={playerRef}
            className={`relative w-full max-w-[320px] overflow-hidden rounded-lg shadow-lg bg-background ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full aspect-video"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />

            <div
                className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="flex items-end  justify-end w-full p-3 space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground hover:bg-background/50 w-4 h-4"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>

                    <Slider
                        value={[progress]}
                        onValueChange={handleSeek}
                        max={100}
                        step={0.1}
                        className="h-2 cursor-pointer flex-1 mb-1"
                    />

                    <div
                        className="
                                relative group
                                flex flex-col items-center justify-end 
                                w-8 h-[120px]
                            "
                    >
                        <div
                            className="
                                absolute top-0 left-1/2 -translate-x-1/2
                                opacity-0 pointer-events-none 
                                transition-opacity duration-200 ease-in-out 
                                group-hover:opacity-100 group-hover:pointer-events-auto 
                                flex flex-col items-center justify-center
                            "
                        >
                            <Slider
                                orientation="vertical"
                                value={[isMuted ? 0 : volume * 100]}
                                onValueChange={handleVolumeChange}
                                max={100}
                                step={1}
                                className="h-24 w-2 cursor-pointer bg-background rounded-full shadow"
                            />
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="
                                text-foreground hover:bg-background/50
                                w-4 h-4
                                mt-auto 
                            "
                            onClick={toggleMute}
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
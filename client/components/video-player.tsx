"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Fullscreen,
    PictureInPicture,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
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

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (playerRef.current?.requestFullscreen) {
                playerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const togglePiP = async () => {
        if (videoRef.current) {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
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

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            if (controlsTimeout) clearTimeout(controlsTimeout);
        };
    }, [controlsTimeout]);

    return (
        <div
            ref={playerRef}
            className={`relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg bg-background ${className}`}
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
                <div className="px-4 pb-1">
                    <Slider
                        value={[progress]}
                        onValueChange={handleSeek}
                        max={100}
                        step={0.1}
                        className="h-2 cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground hover:bg-background/50"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <Pause className="h-5 w-5" />
                            ) : (
                                <Play className="h-5 w-5" />
                            )}
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-foreground hover:bg-background/50"
                                onClick={toggleMute}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-5 w-5" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </Button>
                            <Slider
                                value={[isMuted ? 0 : volume * 100]}
                                onValueChange={handleVolumeChange}
                                max={100}
                                step={1}
                                className="w-24 h-2 cursor-pointer"
                            />
                        </div>

                        <div className="text-sm font-medium text-white">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground hover:bg-background/50"
                            onClick={togglePiP}
                        >
                            <PictureInPicture className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground hover:bg-background/50"
                            onClick={toggleFullscreen}
                        >
                            <Fullscreen className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
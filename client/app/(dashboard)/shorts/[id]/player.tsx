"use client";

import Hls from "hls.js";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type VideoPlayerHandle = {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  toggleMute: () => void;
  isPlaying: () => boolean;
};
type VideoPlayerProps = {
  videoUrl: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onReady?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
};

const ControlledVideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ videoUrl, autoPlay = false, muted = false, loop = true, onReady, onLoadedMetadata, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seekTo: (s: number) => {
        if (videoRef.current)
          videoRef.current.currentTime = s;
      },
      toggleMute: () => {
        if (videoRef.current)
          videoRef.current.muted = !videoRef.current.muted;
      },
      isPlaying: () => !!(videoRef.current && !videoRef.current.paused),
    }));

    useEffect(() => {
      if (!videoUrl || !videoRef.current)
        return;

      const video = videoRef.current;
      setIsLoading(true);

      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60,
          maxMaxBufferLength: 90,
          startFragPrefetch: true,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
          const duration = data.details?.totalduration || 0;
          onLoadedMetadata?.(duration);
          setIsLoading(false);
          if (autoPlay)
            video.play().catch(() => {});
          onReady?.();
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          setIsLoading(false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS.js error", data);
        });

        return () => hls.destroy();
      }
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", () => {
          const duration = video.duration || 0;
          onLoadedMetadata?.(duration);
          if (autoPlay)
            video.play().catch(() => {});
          onReady?.();
        });

        video.addEventListener("canplay", () => setIsLoading(false));
      }
    }, [videoUrl]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video)
        return;

      const handleMetadata = () => {
        const duration = video.duration || 0;
        onLoadedMetadata?.(duration);
      };
      const handleTime = () => {
        onTimeUpdate?.(video.currentTime);
      };

      video.addEventListener("loadedmetadata", handleMetadata);
      video.addEventListener("timeupdate", handleTime);
      video.addEventListener("waiting", () => setIsLoading(true));
      video.addEventListener("playing", () => setIsLoading(false));

      return () => {
        video.removeEventListener("loadedmetadata", handleMetadata);
        video.removeEventListener("timeupdate", handleTime);
        video.removeEventListener("waiting", () => setIsLoading(true));
        video.removeEventListener("playing", () => setIsLoading(false));
      };
    }, [onLoadedMetadata, onTimeUpdate]);

    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className="h-6 w-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
          </div>
        )}
        <video
          preload={autoPlay ? "auto" : "none"}
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          controls={false}
          onContextMenu={e => e.preventDefault()}
        />
      </div>
    );
  },
);

export default ControlledVideoPlayer;

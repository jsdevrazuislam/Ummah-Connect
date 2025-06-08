"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Gauge } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { formatTime, parseFormattedTime } from "@/lib/utils";


export function AudioPlayer({
  audioUrl,
  duration,
}: {
  audioUrl: string;
  duration: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const maxDuration = parseFormattedTime(duration);

  const displayedTime = seekTime !== null ? seekTime : currentTime;

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && seekTime === null) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    setSeekTime(value[0]);
  };

  const handleSeekCommit = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
    setSeekTime(null);
  };

  const changeSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  return (
    <div className="flex items-center gap-4 rounded-lg w-full max-w-md">
      <audio
        key={audioUrl}
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />

      <button
        onClick={togglePlayPause}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <Slider
          value={[displayedTime]}
          max={maxDuration}
          step={0.1}
          onValueChange={handleSeek}
          onValueCommit={handleSeekCommit}
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(displayedTime)}</span>
          <span>{duration}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
            <Gauge className="h-4 w-4" />
            {playbackRate}x
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-20">
          {[1, 1.5, 2, 2.5].map((rate) => (
            <DropdownMenuItem key={rate} onClick={() => changeSpeed(rate)}>
              {rate}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

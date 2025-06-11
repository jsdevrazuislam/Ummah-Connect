"use client"
import { useEffect, useRef } from "react";

const useRingtone = (url: string, loop: boolean, isPlaying: boolean) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isPlaying) {
            if (!audioRef.current) {
                audioRef.current = new Audio(url);
                audioRef.current.loop = loop;
            }
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [isPlaying, url, loop]);
};


export default useRingtone
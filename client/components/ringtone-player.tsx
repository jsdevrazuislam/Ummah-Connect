"use client";

import { useEffect, useRef } from "react";
import { useCallStore } from "@/hooks/use-call-store";

export function RingtonePlayer() {
    const { isPlayingRingtone } = useCallStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof Audio === 'undefined') return;

        if (!audioRef.current) {
            audioRef.current = new Audio("/ringtone.mp3");
            audioRef.current.loop = true;
            audioRef.current.volume = 0.8;
            audioRef.current.muted = true;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const playRingtone = async () => {
           audio.muted = false;
           await audio.play();
        };

        if (isPlayingRingtone) {
            playRingtone();
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = true;
        }
    }, [isPlayingRingtone]);

    return null;
}
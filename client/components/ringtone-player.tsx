"use client";

import { useEffect } from "react";
import { useCallStore } from "@/hooks/use-call-store";

let ringtoneAudio: HTMLAudioElement | null = null;
if (typeof Audio !== 'undefined' && typeof window !== 'undefined') {
    ringtoneAudio = new Audio("/ringtone.mp3");
    ringtoneAudio.loop = true;
    ringtoneAudio.volume = 0.8;
    ringtoneAudio.muted = true;
}

export function RingtonePlayer() {
    const { isPlayingRingtone } = useCallStore();

    useEffect(() => {
        if (!ringtoneAudio) return;

        const tryPlay = async () => {
            try {
                ringtoneAudio.muted = false;
                await ringtoneAudio.play();
            } catch (err) {
                console.error("Ringtone autoplay blocked:", err);
            }
        };

        if (isPlayingRingtone) {
            tryPlay();
        } else {
            ringtoneAudio.pause();
            ringtoneAudio.currentTime = 0;
            ringtoneAudio.muted = true;
        }
    }, [isPlayingRingtone]);

    useEffect(() => {
        const unlockAudio = () => {
            if (ringtoneAudio) {
                ringtoneAudio.play().catch(() => { });
                ringtoneAudio.pause();
                ringtoneAudio.currentTime = 0;
            }
            window.removeEventListener("click", unlockAudio);
        };

        window.addEventListener("click", unlockAudio);

        return () => {
            window.removeEventListener("click", unlockAudio);
        };
    }, []);



    return null;
}
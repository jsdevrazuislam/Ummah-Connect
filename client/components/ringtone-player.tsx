"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCallStore } from "@/hooks/use-call-store";
import { Button } from "@/components/ui/button"; 

export function RingtonePlayer() {
    const { isPlayingRingtone } = useCallStore();
    const audioRef = useRef<HTMLAudioElement | null>(null); 
    const [needsUserInteraction, setNeedsUserInteraction] = useState(false); 

    useEffect(() => {
        if (typeof Audio === 'undefined') return; 

        if (!audioRef.current) {
            audioRef.current = new Audio("/ringtone.mp3");
            audioRef.current.loop = true;
            audioRef.current.volume = 0.8;
            audioRef.current.muted = true;
            console.log("RingtonePlayer: Audio element created.");
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
            try {
                audio.muted = false;
                await audio.play();
                setNeedsUserInteraction(false);
                console.log("RingtonePlayer: Ringtone started playing.");
            } catch (err) {
                console.error("RingtonePlayer: Autoplay blocked:", err);
                if (err instanceof DOMException && err.name === 'NotAllowedError') {
                    setNeedsUserInteraction(true);
                    audio.muted = true;
                } else {
                    console.error("RingtonePlayer: Other audio error:", err);
                }
            }
        };

        if (isPlayingRingtone) {
            playRingtone();
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = true;
            setNeedsUserInteraction(false);
        }
    }, [isPlayingRingtone]);

    const handleUserInteractionForAudio = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlayingRingtone) {
                audio.muted = false;
                audio.play().then(() => {
                    setNeedsUserInteraction(false);
                }).catch(e => {
                    console.error("RingtonePlayer: Failed to play audio after user click:", e);
                });
            } else {
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = true;
                    setNeedsUserInteraction(false);
                }).catch(e => console.error("RingtonePlayer: Error during brief unlock play:", e));
            }
        }
    }, [isPlayingRingtone]);


    if (needsUserInteraction) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] text-white">
                <div className="text-center p-4">
                    <p className="text-xl mb-4">Your browser blocked automatic audio playback.</p>
                    <Button
                        onClick={handleUserInteractionForAudio}
                        className="text-white"
                    >
                        Click to Enable Sound
                    </Button>
                    <p className="mt-2 text-sm text-gray-400">This is required for ringtones and call audio.</p>
                </div>
            </div>
        );
    }

    return null;
}
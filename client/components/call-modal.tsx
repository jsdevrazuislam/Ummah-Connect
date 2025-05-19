"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Phone, Volume2, VolumeX } from "lucide-react"

interface User {
  name: string
  username: string
  avatar: string
}

interface CallModalProps {
  user: User
  callType: "audio" | "video"
  onClose: () => void
  incoming?: boolean
}

export function CallModal({ user, callType, onClose, incoming = false }: CallModalProps) {
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | "ended">(incoming ? "ringing" : "ringing")
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)

  useEffect(() => {
    // Simulate call connection after a delay
    const connectionTimer = setTimeout(
      () => {
        if (callStatus === "ringing") {
          setCallStatus("connected")
        }
      },
      incoming ? 3000 : 5000,
    )

    return () => clearTimeout(connectionTimer)
  }, [callStatus, incoming])

  useEffect(() => {
    // Update call duration when connected
    let durationTimer: NodeJS.Timeout

    if (callStatus === "connected") {
      durationTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (durationTimer) clearInterval(durationTimer)
    }
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    setCallStatus("ended")
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const toggleMute = () => setIsMuted(!isMuted)
  const toggleVideo = () => setIsVideoOff(!isVideoOff)
  const toggleSpeaker = () => setIsSpeakerOff(!isSpeakerOff)

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          {callType === "video" && callStatus === "connected" ? (
            <div className="relative w-full aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
              {/* This would be the video stream in a real app */}
              {!isVideoOff ? (
                <img
                  src="/placeholder.svg?height=400&width=600&text=Video+Call"
                  alt="Video call"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Small self-view */}
              <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-black/50 rounded-lg overflow-hidden border border-background">
                <img
                  src="/placeholder.svg?height=100&width=150&text=You"
                  alt="Your video"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}

          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground mb-4">
            {callStatus === "ringing"
              ? incoming
                ? "Incoming call..."
                : "Calling..."
              : callStatus === "connected"
                ? formatDuration(callDuration)
                : "Call ended"}
          </p>

          {callStatus === "connected" && (
            <div className="flex gap-4 mb-6">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${isMuted ? "bg-red-100 text-red-500 dark:bg-red-900/20" : ""}`}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {callType === "video" && (
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full ${isVideoOff ? "bg-red-100 text-red-500 dark:bg-red-900/20" : ""}`}
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${isSpeakerOff ? "bg-red-100 text-red-500 dark:bg-red-900/20" : ""}`}
                onClick={toggleSpeaker}
              >
                {isSpeakerOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          )}

          <div className="flex gap-4">
            {callStatus === "ringing" && incoming && (
              <>
                <Button variant="outline" className="rounded-full px-8" onClick={onClose}>
                  Decline
                </Button>
                <Button
                  className="rounded-full px-8 bg-green-600 hover:bg-green-700"
                  onClick={() => setCallStatus("connected")}
                >
                  Accept
                </Button>
              </>
            )}

            {(callStatus === "connected" || (callStatus === "ringing" && !incoming)) && (
              <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full" onClick={handleEndCall}>
                <Phone className="h-6 w-6 rotate-135" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

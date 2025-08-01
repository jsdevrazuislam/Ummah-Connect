"use client";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import SocketEventEnum from "@/constants/socket-event";
import { useCallActions, useCallStore } from "@/hooks/use-call-store";
import { useSocketStore } from "@/hooks/use-socket";
import { useStore } from "@/store/store";

function MyVideoConferenceLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout tracks={tracks} style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
      <ParticipantTile />
    </GridLayout>
  );
}

function RoomEventHandler({ onLeave }: { onLeave: () => void }) {
  const room = useRoomContext();

  useEffect(() => {
    const handleDisconnected = () => {
      onLeave();
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, onLeave]);

  return null;
}

export default function CallInterface({ roomName, callType, authToken }: { roomName: string; callType: string; authToken: string }) {
  const router = useRouter();
  const { socket } = useSocketStore();

  const { token, livekitUrl, isFetchingToken } = useCallStore();
  const { fetchToken, endCall } = useCallActions();
  const { user } = useStore();

  useEffect(() => {
    if (typeof roomName !== "string" || (callType !== "audio" && callType !== "video")) {
      router.push("/");
      return;
    }

    if (!token && user) {
      fetchToken(roomName, user.fullName ?? `user-${Date.now()}`, callType);
    }
  }, [roomName, callType, token, fetchToken, router, user]);

  const handleLeave = () => {
    socket?.emit(SocketEventEnum.CALLER_LEFT, { roomName, authToken, userId: user?.id, callerAvatar: user?.avatar, callerName: user?.fullName });
    endCall();
    router.push("/");
  };

  if (isFetchingToken || !token || !livekitUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        {" "}
        Getting ready...
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={callType === "video"}
      audio={true}
      token={token}
      serverUrl={livekitUrl}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <RoomEventHandler onLeave={handleLeave} />
      <MyVideoConferenceLayout />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
}

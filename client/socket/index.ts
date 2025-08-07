import type { Socket } from "socket.io-client";

import { io } from "socket.io-client";

import { SERVER_URL } from "@/lib/apis/api";
import { useStore } from "@/store/store";

export function createSocketConnection(): Socket {
  const token = useStore.getState().accessToken;
  const socket = io(SERVER_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO Server");
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.IO Server");
  });

  return socket;
}

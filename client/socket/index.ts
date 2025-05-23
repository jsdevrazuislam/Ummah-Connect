import { SERVER_URL } from "@/lib/apis/api";
import { useAuthStore } from "@/store/store";
import { io, Socket } from "socket.io-client";


export const createSocketConnection = (): Socket => {
  const token = useAuthStore.getState().accessToken;
  const socket = io(SERVER_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: {
      token
    },
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO Server");
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.IO Server");
  });

  return socket;
};
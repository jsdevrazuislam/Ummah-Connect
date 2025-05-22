import { create } from "zustand";
import { Socket } from "socket.io-client";
import { createSocketConnection } from "@/socket";

interface SocketState {
  socket: Socket | null;
  initializeSocket: () => void;
  disconnectSocket: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,

  initializeSocket: () => {
    if (!useSocketStore.getState().socket) {
      const newSocket = createSocketConnection();
      set({ socket: newSocket });
    }
  },

  disconnectSocket: () => {
    const { socket } = useSocketStore.getState();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
import type { Socket } from "socket.io-client";

import { create } from "zustand";

import { createSocketConnection } from "@/socket";

type SocketState = {
  socket: Socket | null;
  initializeSocket: () => void;
  disconnectSocket: () => void;
};

export const useSocketStore = create<SocketState>(set => ({
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
      socket.close();
      set({ socket: null });
    }
  },
}));

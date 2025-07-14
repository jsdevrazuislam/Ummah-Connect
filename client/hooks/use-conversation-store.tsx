import { create } from "zustand"

type UnreadMap = Record<number, number> 

interface ConversationState {
  unreadCounts: UnreadMap;
  setUnreadCount: (conversationId: number, count: number) => void;
  incrementUnreadCount: (conversationId: number) => void;
  resetUnreadCount: (conversationId: number) => void;
  setBulkUnreadCounts: (data: UnreadMap) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  unreadCounts: {},

  setUnreadCount: (conversationId, count) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: count,
      },
    })),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),

  resetUnreadCount: (conversationId) =>
    set((state) => {
      const { [conversationId]: _, ...rest } = state.unreadCounts;
      console.log(_)
      return { unreadCounts: { ...rest, [conversationId]: 0 } }
    }),

  setBulkUnreadCounts: (data) => set(() => ({ unreadCounts: data })),
}))

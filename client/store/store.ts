import { create } from "zustand";
import Cookies from "js-cookie";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "@/constants";
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

const storeResetFns = new Set<() => void>()

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: Cookies.get(ACCESS_TOKEN) || null,
    refreshToken: Cookies.get(REFRESH_TOKEN) || null,
    isAuthenticated: !!Cookies.get(ACCESS_TOKEN),
    selectedConversation: null,
    user: null,
    isLoading: false,
    isOpen: false,
    onlineUsers: new Map(),
    lastSeen: new Map(),
    setUser: (user) => set({ user }),
    setIsOpen: (value) => set({ isOpen: value }),
    setSelectedConversation: (data) => {
        set({
            selectedConversation: data
        })
    },
    setLogin: (accessToken, refreshToken, user) => {
        Cookies.set(ACCESS_TOKEN, accessToken);
        Cookies.set(REFRESH_TOKEN, refreshToken);
        set({
            accessToken,
            user,
            refreshToken,
            isAuthenticated: true,
        });
    },
    logout: () => {
        const resetAllStores = () => {
            storeResetFns.forEach((resetFn) => {
                resetFn()
            })
        }
        resetAllStores()
        Cookies.remove(REFRESH_TOKEN);
        Cookies.remove(ACCESS_TOKEN);
    },
    initialLoading: async () => {
        if (get().accessToken) {
            const { data } = await api.get(ApiStrings.ME)
            set({
                user: data?.data?.user
            })
        }
    },

    setOnline: (userId, isOnline) =>
        set(state => ({
            onlineUsers: new Map(state.onlineUsers).set(userId, isOnline),
        })),

    setLastSeen: (userId, timestamp) =>
        set(state => ({
            lastSeen: new Map(state.lastSeen).set(userId, timestamp),
        })),

    markUserOnline: (userId: number) => {
        set(state => {
            const newOnlineUsers = new Map(state.onlineUsers);
            newOnlineUsers.set(userId, true);
            return { onlineUsers: newOnlineUsers };
        });
    },

    markUserOffline: (userId: number) => {
        set(state => {
            const newOnlineUsers = new Map(state.onlineUsers);
            newOnlineUsers.set(userId, false); 
            return { onlineUsers: newOnlineUsers };
        });
    },

    updateLastSeen: (userId: number, date: number) => {
        set(state => {
            const newLastSeen = new Map(state.lastSeen);
            newLastSeen.set(userId, date); 
            return { lastSeen: newLastSeen };
        });
    },

    getIsUserOnline: (userId: number) => {
        return get().onlineUsers.get(userId) || false;
    },

    getUserLastSeen: (userId: number) => {
        return get().lastSeen.get(userId) ?? 0;
    },


}));
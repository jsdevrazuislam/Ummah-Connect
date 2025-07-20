import { create } from "zustand";
import Cookies from "js-cookie";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "@/constants";
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";
import { getCurrentLocation, getPrayerTimes } from "@/lib/prayer";

const storeResetFns = new Set<() => void>()

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: Cookies.get(ACCESS_TOKEN) || null,
    refreshToken: Cookies.get(REFRESH_TOKEN) || null,
    prayerTime: null,
    isAuthenticated: !!Cookies.get(ACCESS_TOKEN),
    selectedConversation: null,
    hijriDate: null,
    user: null,
    isLoading: false,
    isOpen: false,
    onlineUsers: new Map(),
    lastSeen: new Map(),
     totalUnread: 0,
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
            try {
                const { data } = await api.get(ApiStrings.ME)
                const coords = await getCurrentLocation()
                const { date, timings} = await getPrayerTimes(coords.latitude, coords.longitude)
                const user = data?.data?.user
                
                set({ 
                    prayerTime: timings,
                    hijriDate: date,
                })
                set({
                    user
                })
            } catch (error) {
                console.log("initialLoading Error", error)
            }
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
    setTotalUnread: (count) => set({ totalUnread: count }),
    decrementUnread: () => set((state) => ({ totalUnread: Math.max(0, state.totalUnread - 1) })),
}));
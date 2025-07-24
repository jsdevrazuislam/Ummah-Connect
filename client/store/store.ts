import { create } from "zustand";
import Cookies from "js-cookie";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "@/constants";
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";
import { getCurrentLocation, getPrayerTimes } from "@/lib/prayer";
import { fetchReverseGeocode } from "@/lib/apis/prayer";

const storeResetFns = new Set<() => void>()

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: Cookies.get(ACCESS_TOKEN) || null,
    refreshToken: Cookies.get(REFRESH_TOKEN) || null,
    prayerTime: null,
    isAuthenticated: !!Cookies.get(ACCESS_TOKEN),
    selectedConversation: null,
    hijriDate: null,
    user: null,
    location: null,
    stories: null,
    isLoading: true,
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
                const { data: storiesData } = await api.get<StoryResponse>(ApiStrings.GET_STORIES)
                const { latitude, longitude } = await getCurrentLocation()
                const { date, timings } = await getPrayerTimes(latitude, longitude)
                const user = data?.data?.user
                const { city, country } = await fetchReverseGeocode(latitude, longitude)
                const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
                const { condition, temp } = await res.json();

                set({
                    user,
                    stories: storiesData?.data,
                    prayerTime: timings,
                    hijriDate: date,
                    location: {
                        latitude,
                        longitude,
                        city,
                        country,
                        condition,
                        temp
                    }
                })
            } catch (error) {
                console.log("initialLoading Error", error)
            } finally {
                set({
                    isLoading: false
                })
            }
        } else {
            set({
                isLoading: false
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
    setTotalUnread: (count) => set({ totalUnread: count }),
    decrementUnread: () => set((state) => ({ totalUnread: Math.max(0, state.totalUnread - 1) })),
    addStory: (newStory) => set((state) => {
        if (!state.user) return state;

        const userId = state.user.id;
        const safeStories = state?.stories ?? []
        const existingUserStoryIndex = safeStories.findIndex(story => story.id === userId);

        if (existingUserStoryIndex >= 0) {
            const updatedStories = [...safeStories];
            updatedStories[existingUserStoryIndex] = {
                ...updatedStories[existingUserStoryIndex],
                stories: [
                    newStory,
                    ...(updatedStories[existingUserStoryIndex].stories || [])
                ]
            };
            return { stories: updatedStories };
        } else {
            const newStoryEntity: StoryEntity = {
                id: userId,
                username: state.user.username,
                avatar: state.user.avatar,
                full_name: state.user.full_name,
                stories: [newStory]
            };
            return { stories: [newStoryEntity, ...safeStories] };
        }
    }),
}));
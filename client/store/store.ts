import Cookies from "js-cookie";
import { create } from "zustand";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";
import { getNotifications } from "@/lib/apis/notification";
import { getPrayerTimes } from "@/lib/prayer";

const storeResetFns = new Set<() => void>();

export const useStore = create<AuthState>((set, get) => ({
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
  notificationErrorMessage: "",
  onlineUsers: new Map(),
  lastSeen: new Map(),
  notifications: [],
  unreadCount: 0,
  notificationsPage: 1,
  hasMoreNotifications: true,
  notificationLoading: false,
  setNotifications: (notifications, unreadCount) => {
    set({ notifications, unreadCount });
  },
  addNotification: (newNotification: NotificationsEntity) => {
    const { notifications, unreadCount } = get();

    set({
      notifications: [newNotification, ...(notifications ?? [])],
      unreadCount: unreadCount + 1,
    });
  },
  markAsRead: () => {
    const { notifications } = get();

    if (!notifications)
      return;

    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      isRead: true,
    }));

    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
  },
  fetchNotifications: async () => {
    try {
      const { notificationsPage, notifications } = get();

      const res = await getNotifications({
        page: notificationsPage + 1,
        limit: 10,
      });

      const newNotifs = res.data.notifications ?? [];
      const { total, page, limit } = res.data;

      const hasMore = page * limit < total;

      set({
        notifications: [...notifications, ...newNotifs],
        notificationsPage: notificationsPage + 1,
        hasMoreNotifications: hasMore,
      });
    }
    catch (error) {
      console.log("Notification Fetch Error", error);
    }
  },

  deleteNotificationFromStore: (id) => {
    const { notifications, unreadCount } = get();
    const filtered = notifications.filter(n => n.id !== id);
    const isUnread = notifications.find(n => n.id === id)?.is_read === false;

    set({
      notifications: filtered,
      unreadCount: isUnread ? unreadCount - 1 : unreadCount,
    });
  },

  fetchPrayerTimes: async (latitude, longitude) => {
    const { date, timings } = await getPrayerTimes(latitude, longitude);
    set({
      prayerTime: timings,
      hijriDate: date,

    });
  },

  deleteStoryFromStore: (storyId: number) => {
    const { stories } = get();

    const updated = stories?.map(user => ({
      ...user,
      stories: user.stories.filter(story => story.id !== storyId),
    })).filter(user => user.stories.length > 0);

    set({ stories: updated });
  },

  setUser: user => set({ user }),
  setIsOpen: value => set({ isOpen: value }),
  setSelectedConversation: (data) => {
    set({
      selectedConversation: data,
    });
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
        resetFn();
      });
    };
    resetAllStores();
    Cookies.remove(REFRESH_TOKEN);
    Cookies.remove(ACCESS_TOKEN);
  },
  initialLoading: async () => {
    if (get().accessToken) {
      try {
        const [
          userRes,
          notificationsRes,
          storiesRes,
        ] = await Promise.allSettled([
          api.get<ProfileUser>(ApiStrings.ME),
          getNotifications({ page: 1, limit: 10 }),
          api.get<StoryResponse>(ApiStrings.GET_STORIES),
        ]);

        const user = userRes.status === "fulfilled" ? userRes.value?.data?.data?.user : null;
        const notifications = notificationsRes.status === "fulfilled" ? notificationsRes.value?.data?.notifications ?? [] : [];
        const unreadCount = notificationsRes.status === "fulfilled" ? notificationsRes.value?.data?.unreadCount ?? 0 : 0;
        const stories = storiesRes.status === "fulfilled" ? storiesRes.value?.data?.data : [];

        let prayerTime = null;
        let hijriDate = null;
        let locationInfo = null;

        if (user?.location && user?.latitude) {
          const latitude = user?.latitude;
          const longitude = user?.longitude;

          const [prayerRes, weatherRes] = await Promise.allSettled([
            getPrayerTimes(latitude, longitude),
            fetch(`/api/weather?lat=${latitude}&lon=${longitude}`).then(res => res.json()),
          ]);

          prayerTime = prayerRes.status === "fulfilled" ? prayerRes.value.timings : null;
          hijriDate = prayerRes.status === "fulfilled" ? prayerRes.value.date : null;
          locationInfo = {
            condition: weatherRes.status === "fulfilled" ? weatherRes.value.condition : null,
            temp: weatherRes.status === "fulfilled" ? weatherRes.value.temp : null,
          };
        }
        set({
          user,
          notifications,
          unreadCount,
          stories,
          prayerTime,
          hijriDate,
          location: locationInfo,
        });
      }
      catch (err) {
        console.error("initialLoading error", err);
      }
      finally {
        set({ isLoading: false });
      }
    }
    else {
      set({
        isLoading: false,
      });
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
    set((state) => {
      const newOnlineUsers = new Map(state.onlineUsers);
      newOnlineUsers.set(userId, true);
      return { onlineUsers: newOnlineUsers };
    });
  },

  markUserOffline: (userId: number) => {
    set((state) => {
      const newOnlineUsers = new Map(state.onlineUsers);
      newOnlineUsers.set(userId, false);
      return { onlineUsers: newOnlineUsers };
    });
  },

  updateLastSeen: (userId: number, date: number) => {
    set((state) => {
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
  addStory: newStory => set((state) => {
    if (!state.user)
      return state;

    const userId = state.user.id;
    const safeStories = state?.stories ?? [];
    const existingUserStoryIndex = safeStories.findIndex(story => story.id === userId);

    if (existingUserStoryIndex >= 0) {
      const updatedStories = [...safeStories];
      updatedStories[existingUserStoryIndex] = {
        ...updatedStories[existingUserStoryIndex],
        stories: [
          newStory,
          ...(updatedStories[existingUserStoryIndex].stories || []),
        ],
      };
      return { stories: updatedStories };
    }
    else {
      const newStoryEntity: StoryEntity = {
        id: userId,
        username: state.user.username,
        avatar: state.user.avatar,
        fullName: state.user.fullName,
        stories: [newStory],
      };
      return { stories: [newStoryEntity, ...safeStories] };
    }
  }),
}));

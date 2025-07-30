interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isOpen: boolean;
  isAuthenticated: boolean;
  setLogin: (accessToken: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  user: User | null;
  deleteStoryFromStore: (id:number) => void
  initialLoading: () => void
  selectedConversation: MessageSender | null
  setSelectedConversation: (data:MessageSender | null) => void
  onlineUsers: Map<number, boolean>;
  lastSeen: Map<number, number>; 
  setOnline: (userId: number, isOnline: boolean) => void;
  setLastSeen: (userId: number, timestamp: number) => void;
  markUserOnline: (userId: number) => void;
  markUserOffline: (userId: number) => void;
  updateLastSeen: (userId: number, date:number) => void;
  getIsUserOnline: (userId: number) => boolean;
  getUserLastSeen: (userId: number) => number;
  setIsOpen: (value:boolean) => void
  prayerTime: null | Timings
  fetchPrayerTimes: (latitude: number, longitude: number) => Promise<void>
  hijriDate: null | PrayerDate
  stories: StoryEntity[] | null;
  addStory: (newStory: Story) => void;
  isLoading: boolean
  location: MyLocation | null
  notifications: NotificationsEntity[];
  unreadCount: number;
  notificationsPage: number;
  hasMoreNotifications: boolean;
  notificationErrorMessage: string;
  notificationLoading: boolean;
  setNotifications: (n: NotificationsEntity[], unreadCount: number) => void;
  addNotification: (n: NotificationsEntity) => void;
  fetchNotifications: () => Promise<void>;
  deleteNotificationFromStore: (id: number) => void;
  markAsRead: () => void;
}


interface MyLocation {
    condition:string
    temp: number
}

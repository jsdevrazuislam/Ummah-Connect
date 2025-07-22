interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isOpen: boolean;
  isAuthenticated: boolean;
  setLogin: (accessToken: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  user: User | null;
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
  hijriDate: null | PrayerDate
  totalUnread: number;
  setTotalUnread: (count: number) => void;
  decrementUnread: () => void;
}

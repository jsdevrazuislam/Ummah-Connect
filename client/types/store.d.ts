interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setLogin: (accessToken: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  user: User | null;
  initialLoading: () => void
  selectedConversation: MessageSender | null
  setSelectedConversation: (data:MessageSender) => void
}

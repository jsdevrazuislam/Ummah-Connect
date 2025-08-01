type UserResponse = {
  statusCode: number;
  data: Data;
  message: string;
  success: boolean;
};
type ProfileUser = {
  data: {
    user: User;
  };
};
type UpdateUserResponse = {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
};

type Data = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
type User = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: null;
  location?: null;
  website?: null;
  role: string;
  title?: null;
  refreshToken: string;
  isVerified: boolean;
  verifiedIdentity: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  bio: string;
  gender: string;
  cover: string;
  followingCount: number;
  followersCount: number;
  isTwoFactorEnabled: boolean;
  privacySettings: PrivacySettings;
  notificationPreferences: NotificationPreference;
  is_saved_backup_codes: boolean;
  isFollowing: boolean;
  status?: string;
  totalPosts: number;
  totalLikes: number;
  totalBookmarks: number;
  publicKey?: string;
  latitude: number;
  longitude: number;
};

type JwtResponsePayload = {
  id: number;
  email: string;
  iat: number;
  exp: number;
  role: "user" | "admin" | "super-admin";
};

type NotificationPreference = {
  push_notification: boolean;
  email_notification: boolean;
  prayer_time_notification: boolean;
  like_post: boolean;
  comment_post: boolean;
  mention: boolean;
  new_follower: boolean;
  dm: boolean;
  islamic_event: boolean;
};

type PrivacySettings = {
  message: string;
  post_see: string;
  active_status: boolean;
  read_receipts: boolean;
  location_share: boolean;
  private_account: boolean;
};

type UserStats = {
  totalPosts: number;
  followers_count: number;
  following_count: number;
  totalLikes: number;
  totalBookmarks: number;
};

type UserResponse = {
  statusCode: number;
  data: Data;
  message: string;
  success: boolean;
};
type DeleteUserResponse = {
  statusCode: number;
  data: string;
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
  isDeleteAccount: boolean;
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
  isSavedBackupCodes: boolean;
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
  status: "deleted" | "actived";
};

type NotificationPreference = {
  pushNotification: boolean;
  emailNotification: boolean;
  prayerTimeNotification: boolean;
  likePost: boolean;
  commentPost: boolean;
  mention: boolean;
  newFollower: boolean;
  dm: boolean;
  islamicEvent: boolean;
};

type PrivacySettings = {
  message: string;
  postSee: string;
  activeStatus: boolean;
  readReceipts: boolean;
  locationShare: boolean;
  privateAccount: boolean;
};

type UserStats = {
  totalPosts: number;
  followers_count: number;
  following_count: number;
  totalLikes: number;
  totalBookmarks: number;
};

type DiscoverPeopleResponse = {
  statusCode: number;
  data: DiscoverPeopleData;
  message: string;
  success: boolean;
};
type DiscoverPeopleData = {
  page: number;
  totalPages: number;
  total: number;
  users?: (PeopleEntry)[] | null;
};
type PeopleEntry = {
  id: number;
  username: string;
  fullName: string;
  avatar?: string | null;
  location: string;
  title?: null;
  interests: string[];
  cover?: string | null;
  bio?: string | null;
  followersCount: string;
  followingCount: string;
  postsCount: string;
  isFollowing: boolean;
  verifiedIdentity: boolean;
  dob: string;
};

type DiscoverParams = {
  page: number;
  limit: number;
  search?: string;
  location?: string;
  title?: string;
  interests?: string[];
};

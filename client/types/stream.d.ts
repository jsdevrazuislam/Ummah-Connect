type LiveStreamResponse = {
  statusCode: number;
  data?: (LiveStreamData)[] | null;
  message: string;
  success: boolean;
};
type LiveStreamChatsResponse = {
  statusCode: number;
  data?: {
    messages: LiveStreamChatData[];
    totalPages: number;
    currentPage: number;
  };
  message: string;
  success: boolean;
};

type LiveStreamChatData = {
  id: number;
  streamId: number;
  senderId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
  status?: string;
};
type Sender = {
  id: number;
  username: string;
  fullName: string;
  avatar: string;
};

type StartLiveStreamResponse = {
  statusCode: number;
  data?: {
    stream: LiveStreamData;
  };
  message: string;
  success: boolean;
};

type LiveStreamDetailsResponse = {
  statusCode: number;
  data?: {
    stream: LiveStreamData;
    token: string;
    livekitUrl: string;
  } | null;
  message: string;
  success: boolean;
};
type LiveStreamData = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  tags?: (string)[] | null;
  enableChat: boolean;
  saveRecording: boolean;
  notifyFollowers: boolean;
  roomName: string;
  isActive: boolean;
  startedAt: string;
  endedAt?: null;
  createdAt: string;
  thumbnail?: string;
  viewers?: number;
  user: {
    avatar: string;
    username: string;
    fullName: string;
    id: number;
    isFollowing: boolean;
    followerCount: string;

  };
  updatedAt: string;
};

type ShortsResponse = {
  statusCode: number;
  data: ShortsData;
  message: string;
  success: boolean;
};
type ShortReactResponse = {
  statusCode: number;
  data: ShortsEntity;
  message: string;
  success: boolean;
};
type ShortsData = {
  shorts?: (ShortsEntity)[] | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
};
type ShortsEntity = {
  id: number;
  userId: number;
  videoId: string;
  thumbnailUrl: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: ShortUser;
  share: number;
  totalCommentsCount: number;
  totalReactionsCount: string;
  isFollowing: boolean;
  isBookmarked: boolean;
  currentUserReaction: string;
};
type ShortUser = {
  id: number;
  username: string;
  avatar?: null;
  fullName: string;
};

type QueryOldShortsDataPayload = {
  pageParams: number[];
  pages: ShortsResponse[];
};

type UploadShortsResponse = {
  data: ShortsEntity;
  statusCode: number;
  message: string;
  success: boolean;
};

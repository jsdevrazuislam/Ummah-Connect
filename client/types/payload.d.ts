type LoginPayload = {
  emailOrUsername: string;
  password: string;
  token?: string;
};
type RecoverLoginPayload = {
  emailOrUsername?: string;
  recoveryCode?: string;
};

type CallInitialPayload = {
  roomName: string;
  callType: string;
  authToken: string;
  receiverId: string;
};

type EmailVerifyPayload = {
  email?: string;
  otpCode?: string;
};
type UserOnlineStatusPayload = {
  userId?: number;
  status?: string;
};
type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
  username: string;
  publicKey: string;
};

type UpdatedCommentPayload = {
  content: string;
  id: number;
  isEdited: boolean;
  postId: number;
  parentId: number;
  user: {
    id: number;
    fullName: string;
    avatar: string;
    username: string;
  };
  isReply: boolean;
};

type PostReactPayload = {
  postData: PostsEntity;
  postId: number;
};

type CreateCommentPayload = {
  data: CommentPreview;
};
type CreateCommentReplyPayload = {
  data: RepliesEntity;
};

type CommentReactPayload = {
  postId: number;
  commentId: number;
  parentId: number;
  isReply: boolean;
  data: CommentPreview;
};

type DeleteCommentPayload = {
  id: number;
  userId: number;
  postId: number;
  shortId: number;
  isEdited: boolean;
  parentId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isReply: boolean;
  totalComments?: number;
};

type QueryOldDataPayload = {
  pageParams: number[];
  pages: PostsResponse[];
};
type QueryOldNotificationDataPayload = {
  pageParams: number[];
  pages: NotificationResponse[];
};
type QueryOldDataPayloadConversation = {
  pageParams: number[];
  pages: ConversationMessagesResponse[];
};
type QueryOldDataPayloadLiveStreamChats = {
  pageParams: number[];
  pages: LiveStreamChatsResponse[];
};
type QueryOldDataPayloadConversations = {
  pageParams: number[];
  pages: ConversationResponse[];
};

type CreateConversationPayload = {
  receiverId: string;
  content: string;
  messageType: string;
  type: string;
  keyForRecipient: string;
  keyForSender: string;
};

type ReadMessagePayload = {
  conversationId: number;
  messageId: number;
};
type QueryOldDataCommentsPayload = {
  pageParams: number[];
  pages: CommentsResponse[];
};
type StreamPayload = {
  title: string;
  description: string;
  category: string;
  enableChat: boolean;
  saveRecording: boolean;
  notifyFollowers: boolean;
  tags?: string[] | undefined;
};

type LiveStreamChatPayload = {
  id: number;
  streamId: number;
  senderId: number;
  content: string;
};

type BanLivePayload = {
  bannedUserId: number;
  reason: string;
  durationType: string;
  streamId: number;
};

type ReactionToMessagePayload = {
  id: number;
  emoji: string;
};

type ReplyToMessagePayload = {
  content: string;
  keyForSender: string;
  keyForRecipient: string;
  id: number;
  receiverId?: number;
  conversationId?: number;
  tempId?: number;
};

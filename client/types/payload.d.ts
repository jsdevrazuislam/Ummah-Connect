interface LoginPayload {
  emailOrUsername: string;
  password: string;
  token?: string;
}
interface RecoverLoginPayload {
  emailOrUsername?: string;
  recoveryCode?: string;
}

interface CallInitialPayload {
  roomName: string;
  callType: string;
  authToken: string;
  receiverId: string;
}

interface EmailVerifyPayload {
  email?: string;
  otpCode?: string;
}
interface UserOnlineStatusPayload {
  userId?: number;
  status?: string;
}
interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  username: string;
  public_key: string
}

interface UpdatedCommentPayload {
  content: string;
  id: number;
  isEdited: boolean;
  postId: number;
  parentId: number;
  user: {
    id: number;
    full_name: string;
    avatar: string;
    username: string;
  };
  isReply: boolean;
}

interface PostReactPayload {
  postData: PostsEntity
  postId: number;
}

interface CreateCommentPayload {
  data: CommentPreview;
}
interface CreateCommentReplyPayload {
  data: RepliesEntity;
}

interface CommentReactPayload {
  postId: number;
  commentId: number;
  parentId: number;
  isReply: boolean;
  data: CommentPreview
}

interface DeleteCommentPayload {
  id: number;
  userId: number;
  postId: number;
  isEdited: boolean;
  parentId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isReply: boolean;
  totalComments?: number;
}

interface QueryOldDataPayload {
  pageParams: number[];
  pages: PostsResponse[];
}
interface QueryOldNotificationDataPayload {
  pageParams: number[];
  pages: NotificationResponse[];
}
interface QueryOldDataPayloadConversation {
  pageParams: number[];
  pages: ConversationMessagesResponse[];
}
interface QueryOldDataPayloadLiveStreamChats {
  pageParams: number[];
  pages: LiveStreamChatsResponse[];
}
interface QueryOldDataPayloadConversations {
  pageParams: number[];
  pages: ConversationResponse[];
}

interface CreateConversationPayload {
  receiverId: string;
  content: string;
  messageType: string;
  type: string;
  key_for_recipient: string,
  key_for_sender: string
}

interface ReadMessagePayload {
  conversationId: number;
  messageId: number;
}
interface QueryOldDataCommentsPayload {
  pageParams: number[];
  pages: CommentsResponse[];
}
interface StreamPayload {
  title: string;
  description: string;
  category: string;
  enable_chat: boolean;
  save_recording: boolean;
  notify_followers: boolean;
  tags?: string[] | undefined;
}

interface LiveStreamChatPayload {
  id: number
  stream_id: number, sender_id: number, content: string,
}

interface BanLivePayload {
  banned_user_id: number
  reason: string
  duration_type: string
  stream_id: number
}

interface ReactionToMessagePayload {
  id: number
  emoji: string
}

interface ReplyToMessagePayload {
  content: string,
  key_for_sender: string,
  key_for_recipient: string
  id:number
  receiver_id?:number
  conversationId?:number
  tempId?:number
}
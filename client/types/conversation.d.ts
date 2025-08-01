type ConversationResponse = {
  statusCode: number;
  data: {
    conversations: Conversation[];
    totalPages: number;
    currentPage: number;
    totalConversations: number;
  };
  message: string;
  success: boolean;
};

type Conversation = {
  id: number;
  type: string;
  name: string | undefined;
  avatar: string;
  status?: string;
  userId?: number;
  username?: string;
  lastSeenAt?: string;
  publicKey?: string;
  createdAt: string;
  lastMessage: {
    id: number;
    sender: {
      id: number;
      username: string;
      fullName: string;
      avatar: string;
    } | null;
    content: string;
    type: string;
    sentAt: string;
    keyForSender: string;
    keyForRecipient: string;
  } | null;
  unreadCount: number;
  isMuted: null | undefined;
  sender: {
    fullName: string;
    avatar: string;
    id: number;
    username: string;
  };
};

type ConversationMessagesResponse = {
  statusCode: number;
  data?: {
    messages: ConversationMessages[];
    totalPages?: number;
    currentPage?: number;
  };
  message: string;
  success: boolean;
};
type ConversationMessages = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  parentMessageId?: null | number;
  sentAt: string;
  isDeleted?: boolean | null;
  isUpdated?: boolean;
  deletedById?: null;
  deletedAt?: null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
  status: string;
  reactions: MessageReaction[] | [];
  statuses: MessageStatus[];
  attachments: MessageAttachment[];
  parentMessage?: ParentMessage | null;
  keyForSender: string;
  keyForRecipient?: string;
  tempId?: string | number;
};

type ParentMessage = {
  content: string;
  keyForRecipient: string;
  keyForSender: string;
  sender: MessageSender;
  attachments: MessageAttachment[];
};
type ReplyMessage = {
  id?: number;
  conversationId?: number;
  content?: string;
  receiverId?: number;
  fullName?: string;
};

type MessageAttachment = {
  id: number;
  messageId: number;
  fileUrl: string;
  fileType: string;
  thumbnailUrl?: string;
  duration: number;
  sizeInBytes: number;
  metadata: MessageMetadata;
  createdAt: string;
  updatedAt: string;
};
type MessageMetadata = {
  title?: string;
};
type MessageReaction = {
  id: number;
  messageId: number;
  userId: number;
  emoji: string;
  createdAt: string;
  updatedAt: string;
  reactedUser: MessageSender;
  conversationId?: number;
};

type MessageStatus = {
  status: "sent" | "delivered" | "seen";
  user: MessageSender;
  id: number;
};
type MessageSender = {
  id: number;
  fullName: string;
  avatar: string;
  username: string;
  status?: string;
  conversationId?: number;
  lastSeenAt?: string;
  publicKey?: string;
};

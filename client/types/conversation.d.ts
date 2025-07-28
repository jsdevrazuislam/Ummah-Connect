interface ConversationResponse {
  statusCode: number;
  data: {
    conversations: Conversation[];
    totalPages: number;
    currentPage: number;
    totalConversations: number;
  };
  message: string;
  success: boolean;
}

interface Conversation {
  id: number;
  type: string;
  name: string | undefined;
  avatar: string;
  status?: string;
  userId?: number;
  username?: string;
  last_seen_at?: string;
  public_key?: string;
  createdAt: string;
  lastMessage: {
    id: number;
    sender: {
      id: number;
      username: string;
      full_name: string;
      avatar: string;
    } | null;
    content: string;
    type: string;
    sent_at: string;
    key_for_sender: string
    key_for_recipient: string
  } | null;
  unreadCount: number;
  isMuted: null | undefined;
  sender: {
    full_name: string;
    avatar: string;
    id: number;
    username: string;
  };
}

interface ConversationMessagesResponse {
  statusCode: number;
  data?: {
    messages: ConversationMessages[];
    totalPages: number;
    currentPage: number;
  };
  message: string;
  success: boolean;
}
interface ConversationMessages {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  parent_message_id?: null | number;
  sent_at: string;
  is_deleted?: boolean | null;
  is_updated?: boolean;
  deleted_by_id?: null;
  deleted_at?: null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
  status: string;
  reactions: MessageReaction[] | [];
  statuses: MessageStatus[];
  attachments: MessageAttachment[];
  parentMessage?: ParentMessage | null
  key_for_sender: string
  key_for_recipient?: string
}

interface ParentMessage{
  content:string
  key_for_recipient:string
  key_for_sender:string
  sender: MessageSender
  attachments: MessageAttachment[];
}
interface ReplyMessage {
  id?: number
  conversation_id?: number
  content?: string;
  receiver_id?: number;
  full_name?: string;
}

interface MessageAttachment {
  id: number;
  message_id: number;
  file_url: string;
  file_type: string;
  thumbnail_url?: string;
  duration: number;
  size_in_bytes: number;
  metadata: Metadata;
  createdAt: string;
  updatedAt: string;
}
interface Metadata { }
interface MessageReaction {
  id:number
  message_id:number
  user_id:number
  emoji:string
  createdAt:string
  updatedAt:string
  reactedUser: MessageSender
}

interface MessageStatus {
  status: "sent" | "delivered" | "seen";
  user: MessageSender
}
interface MessageSender {
  id: number;
  full_name: string;
  avatar: string;
  username: string;
  status?: string;
  conversationId?: number;
  last_seen_at?: string;
  public_key?: string
}

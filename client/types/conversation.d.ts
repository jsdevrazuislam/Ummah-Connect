interface ConversationResponse{
    statusCode:number
    data: {
        conversations: Conversation[],
        totalPages:number,
        currentPage: number
        totalConversations:number
    },
    message: string,
    success: boolean
}

interface Conversation{
    id: number;
    type: string;
    name: string | undefined;
    avatar:string;
    status?:string;
    userId?:number
    username?:string
    last_seen_at?:string
    time: string;
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
    } | null;
    unreadCount: number;
    isMuted: null | undefined;
}

 interface ConversationMessagesResponse {
  statusCode: number;
  data?: {
    messages: ConversationMessages[],
    totalPages: number
    currentPage: number
  };
  message: string;
  success: boolean;
}
 interface ConversationMessages {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  parent_message_id?: null;
  sent_at: string;
  is_deleted?: null;
  deleted_by_id?: null;
  deleted_at?: null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
  status:string
  reactions?: (null)[] | null;
  statuses: MessageStatus[]
  attachments: MessageAttachment[]
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
 interface Metadata {
}


interface MessageStatus {
  status: 'sent' | 'delivered' | 'seen'

}
 interface MessageSender {
  id: number;
  full_name: string;
  avatar: string;
  username: string;
  status?: string
  conversationId?:number
  last_seen_at?:string
}

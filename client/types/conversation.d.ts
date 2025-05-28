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
  type: string;
  parent_message_id?: null;
  sent_at: string;
  is_deleted?: null;
  deleted_by_id?: null;
  deleted_at?: null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
  reactions?: (null)[] | null;
}
 interface MessageSender {
  id: number;
  full_name: string;
  avatar: string;
  username: string;
}


export interface ConversationData {
  id: number;
  conversation_id: number;
  user_id: number;
  unread_count: number;
  last_read_message_id?: null;
  joined_at?: null;
  left_at?: null;
  is_admin?: null;
  is_muted?: null;
  is_archived?: null;
  is_blocked?: null;
  createdAt: string;
  updatedAt: string;
  conversation: Conversation;
}
export interface Conversation {
  id: number;
  name?: string;
  type: string;
  last_message_id: number;
  lastMessage: LastMessage;
  participants?: (ParticipantsEntity)[] | null;
}
export interface LastMessage {
  id: number;
  sender_id: number;
  content: string;
  sent_at: string;
  type: string;
  sender: Sender;
}
export interface Sender {
  id: number;
  full_name: string;
  avatar: string;
  username: string;
}
export interface ParticipantsEntity {
  user_id: number;
  unread_count: number;
  user: User;
}
export interface User {
  id: number;
  full_name: string;
  avatar?: null;
  username: string;
}

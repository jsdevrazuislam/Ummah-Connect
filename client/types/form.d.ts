type ReactPayload = {
  reactType: string;
  icon: string;
  id: number;
  postId?: number;
  message?: string;
};

type SharePayload = {
  postId: number;
  message?: string;
  visibility?: string;
};

type CommentPayload = {
  content: string;
  postId: number;
  type?: string;
};
type EditCommentPayload = {
  content: string;
  commentId: number;
  postId: number;
  isReply?: boolean;
  type?: string;
};

type DeletePostCommentPayload = {
  commentId: number;
  parentId: number;
};

type SendMessagePayload = {
  conversationId: number;
  content: string;
  id: number;
  keyForRecipient: string;
  keyForSender: string;
};
type ReplyCommentPayload = {
  content: string;
  postId: number;
  id: number;
  type?: string;
};

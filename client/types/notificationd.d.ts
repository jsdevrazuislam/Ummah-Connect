type NotificationResponse = {
  statusCode: number;
  data: NotificationData;
  message: string;
  success: boolean;
};
type NotificationData = {
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
  notifications?: (NotificationsEntity)[] | null;
};
type NotificationsEntity = {
  id: number;
  senderId: number;
  receiverId: number;
  postId: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  icon: string;
  sender: NotificationSender;
};
type NotificationSender = {
  id: number;
  fullName: string;
  avatar?: null;
  username: string;
};

enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
  COMMENT = "comment",
  REPLY = "reply",
  BOOKMARK = "bookmark",
  MENTION = "mention",
}

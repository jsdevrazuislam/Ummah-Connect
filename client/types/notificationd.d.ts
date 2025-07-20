interface NotificationResponse {
    statusCode: number;
    data: NotificationData;
    message: string;
    success: boolean;
}
interface NotificationData {
    total: number;
    page: number;
    limit: number;
    unreadCount: number;
    notifications?: (NotificationsEntity)[] | null;
}
interface NotificationsEntity {
    id: number;
    sender_id: number;
    receiver_id: number;
    post_id: number;
    type: NotificationType;
    message: string;
    is_read: boolean;
    createdAt: string;
    updatedAt: string;
    sender: NotificationSender;
}
interface NotificationSender {
    id: number;
    full_name: string;
    avatar?: null;
    username: string;
}


enum NotificationType {
    FOLLOW = "follow",
    LIKE = "like",
    COMMENT = "comment",
    REPLY = "reply",
    BOOKMARK = "bookmark",
    MENTION = "mention",
}

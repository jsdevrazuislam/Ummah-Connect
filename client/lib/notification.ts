import { AtSign, Bookmark, Heart, MessageCircle, UserPlus } from "lucide-react";

enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
  COMMENT = "comment",
  REPLY = "reply",
  BOOKMARK = "bookmark",
  MENTION = "mention",
}

export function getNotificationTitle(type: NotificationType | undefined): string {
  switch (type) {
    case NotificationType.LIKE:
      return "liked your post";
    case NotificationType.FOLLOW:
      return "followed you";
    case NotificationType.COMMENT:
      return "commented on your post";
    case NotificationType.REPLY:
      return "replied to your comment";
    case NotificationType.MENTION:
      return "mentioned you in a post";
    case NotificationType.BOOKMARK:
      return "bookmarked your post";
    default:
      return "sent you a notification";
  }
}

export function getNotificationIcon(type: NotificationType | undefined) {
  switch (type) {
    case "follow":
      return UserPlus;
    case "like":
      return Heart;
    case "comment":
    case "reply":
      return MessageCircle;
    case "bookmark":
      return Bookmark;
    case "mention":
      return AtSign;
    default:
      return null;
  }
}

export function getNotificationColorClasses(type: NotificationType | undefined) {
  switch (type) {
    case NotificationType.LIKE:
      return {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-500",
      };
    case NotificationType.FOLLOW:
      return {
        bg: "bg-primary/10",
        text: "text-primary",
      };
    case NotificationType.COMMENT:
    case NotificationType.REPLY:
      return {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-500",
      };
    case NotificationType.MENTION:
      return {
        bg: "bg-amber-100 dark:bg-amber-900",
        text: "text-amber-500",
      };
    case NotificationType.BOOKMARK:
      return {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-500",
      };
    default:
      return {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-500",
      };
  }
}

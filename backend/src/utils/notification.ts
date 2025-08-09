import type { Request } from "express";

import type { NotificationType } from "@/models/notification.models";

import { NOTIFICATION_CACHE } from "@/controllers/notification.controller";
import { Notification } from "@/models";
import { emitSocketEvent, SocketEventEnum } from "@/socket";

type CreateNotificationOptions = {
  req: Request;
  senderId: number;
  receiverId: number;
  type: NotificationType;
  message?: string;
  postId?: number | null | string;
};

export async function createAndInvalidateNotification({
  req,
  senderId,
  receiverId,
  type,
  message,
  postId = null,
}: CreateNotificationOptions) {
  const existingNotification = await Notification.findOne({
    where: {
      senderId,
      receiverId,
      postId,
      type,
    },
  });

  if (existingNotification)
    return;

  const notification = await Notification.create({
    senderId,
    receiverId,
    type,
    message,
    postId,
  });

  await NOTIFICATION_CACHE(senderId);

  emitSocketEvent({
    req,
    roomId: `user:${receiverId}`,
    event: SocketEventEnum.NOTIFY_USER,
    payload: {
      ...notification.toJSON(),
      sender: { avatar: req.user?.avatar, fullName: req.user.fullName },
    },
  });

  return {
    ...notification.toJSON(),
  };
}

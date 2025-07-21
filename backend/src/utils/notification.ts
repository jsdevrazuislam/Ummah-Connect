import redis from "@/config/redis";
import { Notification } from "@/models";
import { NotificationType } from "@/models/notification.models";
import { REDIS_KEY } from "@/controllers/notification.controller";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import { Request } from "express";

interface CreateNotificationOptions {
    req: Request;
    senderId: number;
    receiverId: number;
    type: NotificationType;
    message?: string;
    postId?: number | null | string;
}

export const createAndInvalidateNotification = async ({
    req,
    senderId,
    receiverId,
    type,
    message,
    postId = null,
}: CreateNotificationOptions) => {

    const existingNotification = await Notification.findOne({
        where: {
            sender_id: senderId,
            receiver_id: receiverId,
            post_id: postId,
            type: type,
        },
    });

    if (existingNotification) return

    const notification = await Notification.create({
        sender_id: senderId,
        receiver_id: receiverId,
        type,
        message,
        post_id: postId,
    });

    const keys = await redis.keys(`${REDIS_KEY(senderId)}*`);
    if (keys.length > 0) {
        await redis.del(...keys);
    }

    emitSocketEvent({
        req,
        roomId: `user:${receiverId}`,
        event: SocketEventEnum.NOTIFY_USER, payload: {
            ...notification.toJSON(),
            sender: { avatar: req.user?.avatar, full_name: req.user.full_name, }
        }
    })

    return {
        ...notification.toJSON()
    };
};

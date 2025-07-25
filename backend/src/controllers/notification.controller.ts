import redis from "@/config/redis";
import Notification from "@/models/notification.models";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";

export const REDIS_KEY = (userId: number) => `notifications:user:${userId}`;

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const cacheKey = `${REDIS_KEY(userId)}:page:${page}:limit:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return res.json(new ApiResponse(200, JSON.parse(cached), "From cache"));
    }

    const { rows: notifications, count } = await Notification.findAndCountAll({
        where: { receiver_id: userId },
        order: [["createdAt", "DESC"]],
        offset,
        limit,
        include: [{ association: "sender", attributes: ["id", "full_name", "avatar", "username"] }],
    });

    const unreadCount = await Notification.count({
        where: {
            receiver_id: userId,
            is_read: false,
        },
    });

    const data = {
        total: count,
        page,
        limit,
        notifications,
        unreadCount
    };

    await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

    res.json(new ApiResponse(200, data));
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    await Notification.update(
        { is_read: true },
        { where: { receiver_id: userId, is_read: false } }
    );

    res.json(new ApiResponse(200, {}, "All notifications marked as read"));
});


export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    const notification = await Notification.findOne({
        where: {
            id: notificationId,
            receiver_id: userId,
        },
    });

    if (!notification) {
        return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
    }

    await notification.destroy();

    const keys = await redis.keys(`${REDIS_KEY(userId)}*`);
    if (keys.length > 0) await redis.del(...keys);

    res.json(new ApiResponse(200, null, "Notification deleted"));
});

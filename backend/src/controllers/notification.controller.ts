import type { Request, Response } from "express";

import redis from "@/config/redis";
import Notification from "@/models/notification.models";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";

export const NOTIFICATION_CACHE_KEY = (userId: number) => `notifications:user:${userId}`;
export async function NOTIFICATION_CACHE(userId: number) {
  const keys = await redis.keys(`${NOTIFICATION_CACHE_KEY(userId)}*`);
  if (keys.length > 0)
    await redis.del(...keys);
}

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const cacheKey = `${NOTIFICATION_CACHE_KEY(userId)}:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "From cache"));
  }

  const { rows: notifications, count } = await Notification.findAndCountAll({
    where: { receiverId: userId },
    order: [["createdAt", "DESC"]],
    offset,
    limit,
    include: [{ association: "sender", attributes: ["id", "fullName", "avatar", "username"] }],
  });

  const unreadCount = await Notification.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });

  const data = {
    total: count,
    page,
    limit,
    notifications,
    unreadCount,
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

  res.json(new ApiResponse(200, data));
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  await Notification.update(
    { isRead: true },
    { where: { receiverId: userId, isRead: false } },
  );

  await NOTIFICATION_CACHE(userId);
  res.json(new ApiResponse(200, {}, "All notifications marked as read"));
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const notificationId = Number.parseInt(req.params.id);

  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      receiverId: userId,
    },
  });

  if (!notification) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }

  await notification.destroy();

  await NOTIFICATION_CACHE(userId);

  res.json(new ApiResponse(200, null, "Notification deleted"));
});

import type { Request, Response } from "express";

import fs from "node:fs";
import { literal } from "sequelize";

import sequelize from "@/config/db";
import {
  generateLiveKitToken,
  generateLiveToken,
  roomServiceClient,
} from "@/config/livekit";
import redis from "@/config/redis";
import { SocketEventEnum } from "@/constants";
import { NOTIFICATION_CACHE } from "@/controllers/notification.controller";
import { LiveStream, LiveStreamBan, Notification, Reaction, Shorts, User } from "@/models";
import Short from "@/models/shorts.models";
import StreamChatConversation from "@/models/stream-chat.models";
import { emitSocketEvent } from "@/socket";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import cloudinary, { getThumbnailFromVideo } from "@/utils/cloudinary";
import { getOrSetCache } from "@/utils/helper";
import { getIsBookmarkedLiteral, getIsFollowingLiteral, getTotalCommentsCountLiteral, getTotalReactionsCountLiteral, getUserReactionLiteral } from "@/utils/sequelize-sub-query";
import { isSpam } from "@/utils/spam-detection-algorithm";

export async function DELETE_SHORT_CACHE() {
  const keys = await redis.keys(`shorts:*`);
  if (keys.length > 0)
    await redis.del(...keys);
}

export async function invalidateUserShortsCache(userId: number) {
  const keys = await redis.keys(`user:${userId}:shorts:*`);
  if (keys.length) {
    await redis.del(...keys);
  }
}

export const getStreamToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomName, identity } = req.query;
    if (typeof roomName !== "string" || typeof identity !== "string")
      throw new ApiError(400, "roomName and identity are required");
    const { token, livekitUrl } = await generateLiveKitToken(
      identity,
      roomName,
      req.user.avatar,
      req.user.fullName,
    );

    return res.json(new ApiResponse(200, { token, livekitUrl }, "Success"));
  },
);

export const initiateCall = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomName, callType, authToken, receiverId } = req.body;
    const callerId = req.user.id;
    const user = req.user;

    if (!roomName || !authToken || !receiverId)
      throw new ApiError(400, "Missing data");

    await redis.set(`call-token:${roomName}:${authToken}`, authToken, "EX", 60);

    await redis.set(
      `call:${roomName}`,
      JSON.stringify({
        callerId,
        receiverId,
        type: callType,
        status: "pending",
      }),
      "EX",
      60,
    );

    const socket = req.app.get("io");

    socket.to(`user:${receiverId}`).emit(SocketEventEnum.INCOMING_CALL, {
      from: user?.id,
      authToken,
      callType,
      roomName,
      callerName: user?.fullName,
      callerAvatar: user?.avatar,
    });

    const receiverUser = await User.findOne({ where: { id: receiverId } });

    setTimeout(async () => {
      const callData = await redis.get(`call:${roomName}`);
      if (callData) {
        const call = JSON.parse(callData);
        if (call.status === "pending") {
          socket.to(`user:${callerId}`).emit(SocketEventEnum.CALL_TIMEOUT, {
            roomName,
            reason: "NO_ANSWER",
            message: `${receiverUser?.fullName} didn't answer your call.`,
            callerName: receiverUser?.fullName,
            callerAvatar: receiverUser?.avatar,
          });
          socket.to(`user:${receiverId}`).emit(SocketEventEnum.CALL_TIMEOUT, {
            roomName,
            reason: "NO_ANSWER",
            message: "You missed a call.",
            callerName: user?.fullName,
            callerAvatar: user?.avatar,
          });
          await redis.del(`call:${roomName}`);
          await redis.del(`call-token:${roomName}:${authToken}`);
        }
      }
    }, 50000);

    res.status(200).json(new ApiResponse(200, null, "Call initialized"));
  },
);

export const validateCallToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomName, authToken } = req.query;
    const userId = req.user.id;

    if (!roomName || !authToken) {
      throw new ApiError(400, "Missing required query params");
    }

    const storedToken = await redis.get(`call-token:${roomName}:${authToken}`);
    if (!storedToken || storedToken !== authToken) {
      throw new ApiError(403, "Invalid or expired call token");
    }

    const callMetadata = await redis.get(`call:${roomName}`);
    if (!callMetadata) {
      throw new ApiError(404, "Call metadata not found");
    }

    const { callerId, receiverId } = JSON.parse(callMetadata);

    if (
      String(userId) !== String(callerId)
      && String(userId) !== String(receiverId)
    ) {
      throw new ApiError(403, "You are not authorized to join this call");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Token and user validated"));
  },
);

export const startLiveStream = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      tags,
      enableChat,
      saveRecording,
      notifyFollowers,
    } = req.body;

    const userId = req.user.id;
    const roomName = `live_${req.user.username}_${Date.now()}`;

    const stream = await LiveStream.create({
      userId,
      title,
      description,
      category,
      tags,
      enableChat,
      saveRecording,
      notifyFollowers,
      roomName,
      isActive: true,
      startedAt: new Date(),
    });

    const token = generateLiveToken({
      roomName,
      userId: String(userId),
      userName: req.user.fullName,
      isPublisher: true,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { roomName, token, stream }, "Stream started"),
      );
  },
);

export const startChatLiveStream = asyncHandler(
  async (req: Request, res: Response) => {
    const { streamId, senderId, content } = req.body;

    if (isSpam(senderId, content)) {
      throw new ApiError(400, "Please avoid spamming. Otherwise er ban you from our platform");
    }

    const stream = await LiveStream.findOne({ where: { id: streamId } });
    if (!stream)
      throw new ApiError(404, "Live Stream Not Found");
    if (!stream?.enableChat)
      throw new ApiError(400, "For this live stream chat is disabled");

    const message = await StreamChatConversation.create({
      streamId,
      senderId,
      content,
    });

    const fullMessage = await StreamChatConversation.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar", "fullName"],
        },
      ],
    });

    if (!fullMessage)
      throw new ApiError(404, "Live Stream Conversation Not Found");

    const responseData = {
      ...fullMessage.toJSON(),
    };

    emitSocketEvent({
      req,
      roomId: `live_stream_${streamId}`,
      event: SocketEventEnum.LIVE_CHAT_SEND,
      payload: responseData,
    });

    return res.json(
      new ApiResponse(200, responseData, "Stream details fetched successfully"),
    );
  },
);

export const streamDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { streamId } = req.query;

    if (!streamId) {
      throw new ApiError(400, "streamId is required");
    }

    const stream = await LiveStream.findOne({
      where: { id: streamId, isActive: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "username",
            "fullName",
            "avatar",
            [
              sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "follows"
                        WHERE "follows"."followingId" = "user"."id"
                        )`),
              "followerCount",
            ],
            getIsFollowingLiteral(req.user.id, "\"user\".\"id\""),
          ],
        },
      ],
    });

    if (!stream) {
      throw new ApiError(404, "Stream not found");
    }

    const banned = await LiveStreamBan.findOne({
      where: {
        streamId,
        bannedUserId: req.user.id,
        bannedById: stream?.userId,
      },
    });

    if (banned) {
      const now = new Date();
      const banTime = new Date(banned.createdAt);

      if (banned.banDuration === null) {
        throw new ApiError(
          429,
          "You are permanently banned from this live stream.",
        );
      }
      else if (banned.banDuration === 0) {
        const isActive = stream?.isActive;
        if (isActive) {
          throw new ApiError(
            429,
            "You are banned from this ongoing live stream.",
          );
        }
      }
      else {
        const expiry = new Date(banTime.getTime() + banned.banDuration * 1000);
        if (now < expiry) {
          throw new ApiError(
            429,
            `You are banned from this stream until ${expiry.toLocaleString()}`,
          );
        }
      }
    }

    const count = await redis.get(`report:stream:${streamId}:user:${req.user.id}`);
    if (Number.parseInt(count ?? "0") >= 5) {
      throw new ApiError(429, "You have been removed due to violation");
    }

    const token = await generateLiveToken({
      roomName: stream.roomName,
      userId: String(req.user.id),
      userName: req.user?.fullName,
      isPublisher: stream.userId === req.user.id,
    });

    return res.json(
      new ApiResponse(
        200,
        { stream, token, livekitUrl: process.env.LIVEKIT_URL },
        "Stream details fetched successfully",
      ),
    );
  },
);

export const getStreamChats = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number.parseInt(req.query.page as string) ?? 1;
    const limit = Number.parseInt(req.query.limit as string) ?? 50;
    const skip = (page - 1) * limit;
    const streamId = req.query?.streamId;

    const { count, rows } = await StreamChatConversation.findAndCountAll({
      where: { streamId },
      limit,
      offset: skip,
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "fullName", "avatar"],
        },
      ],
    });

    return res.json(
      new ApiResponse(
        200,
        {
          messages: rows,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        },
        "Stream message fetched successfully",
      ),
    );
  },
);

export const getActiveLives = asyncHandler(
  async (req: Request, res: Response) => {
    const streams = await LiveStream.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "fullName", "avatar"],
        },
      ],
      order: [["startedAt", "DESC"]],
    });

    return res
      .status(200)
      .json(new ApiResponse(200, streams, "Active live streams"));
  },
);

export const endLiveStream = asyncHandler(
  async (req: Request, res: Response) => {
    const { streamId } = req.body;
    const hostId = req.user.id;

    if (!streamId) {
      throw new ApiError(400, "streamId is required");
    }

    const stream = await LiveStream.findByPk(streamId);

    if (!stream) {
      throw new ApiError(404, "Stream not found");
    }

    if (stream.userId !== hostId) {
      throw new ApiError(403, "You are not authorized to end this stream");
    }

    await stream.update({
      isActive: false,
      endedAt: new Date(),
    });

    await StreamChatConversation.destroy({
      where: { streamId },
    });

    await roomServiceClient.deleteRoom(stream.roomName);

    emitSocketEvent({
      req,
      roomId: `live_stream_${streamId}`,
      event: SocketEventEnum.HOST_END_LIVE_STREAM,
      payload: {
        username: req.user.username,
        message: "Host is ending live stream",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Stream ended and room deleted successfully"),
      );
  },
);

export const uploadShort = asyncHandler(async (req: Request, res: Response) => {
  const { description } = req.body;
  const videoPath = req?.file?.path;

  if (!videoPath)
    throw new ApiError(400, "Video file is required");

  const publicId = `${Date.now()}`;

  const uploadRes = await cloudinary.uploader.upload(videoPath, {
    // eslint-disable-next-line camelcase
    resource_type: "video",
    // eslint-disable-next-line camelcase
    public_id: publicId,
    folder: "ummah_connect/shorts",
    // eslint-disable-next-line camelcase
    use_filename: true,
    overwrite: true,
  });

  fs.unlinkSync(videoPath);

  const short = await Shorts.create({
    userId: req.user.id,
    videoId: uploadRes.public_id,
    description,
    isPublic: true,
    thumbnailUrl: getThumbnailFromVideo(uploadRes?.url, req?.file?.mimetype ?? ""),
  });

  const responseData = {
    ...short.toJSON(),
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      avatar: req.user.avatar,
      username: req.user.username,
    },
    totalCommentsCount: 0,
    totalReactionsCount: 0,
    isFollowing: false,
    isBookmarked: false,
    currentUserReaction: null,
  };

  await DELETE_SHORT_CACHE();
  await invalidateUserShortsCache(req.user.id);

  res.json(new ApiResponse(200, responseData, "Short uploaded successfully"));
});

export const getShorts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const cacheKey = `shorts:page:${page}:limit:${limit}:user=${req.user.id}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "Shorts fetched (cached)"));
  }

  const result = await getOrSetCache(cacheKey, async () => {
    const { rows: shorts, count } = await Shorts.findAndCountAll({
      where: { isPublic: true },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "avatar", "fullName"] },
      ],
      attributes: {
        include: [
          getTotalCommentsCountLiteral("\"Short\"", "shortId"),
          getTotalReactionsCountLiteral("\"Short\"", "shortId"),
          getIsBookmarkedLiteral(req.user.id, "\"Short\""),
          getUserReactionLiteral(req.user.id, "\"Short\"", "shortId"),
          getIsFollowingLiteral(req.user.id, "\"Short\".\"userId\""),
        ],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const result = {
      shorts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };

    return result;
  }, 60 * 60 * 24);

  return res.json(
    new ApiResponse(
      200,
      result,
      "Shorts fetched",
    ),
  );
});

export const deleteShort = asyncHandler(async (req: Request, res: Response) => {
  const short = await Shorts.findOne({ where: { id: req.params.shortId } });

  if (!short)
    throw new ApiError(404, "Short not found");
  if (short.userId !== req.user.id)
    throw new ApiError(403, "Unauthorized");

  await short.destroy();

  await cloudinary.uploader.destroy(short.videoId, {
    // eslint-disable-next-line camelcase
    resource_type: "video",
  });

  await DELETE_SHORT_CACHE();
  await invalidateUserShortsCache(req.user.id);

  return res.json(new ApiResponse(200, {}, "Short deleted"));
});

export const videoReact = asyncHandler(async (req: Request, res: Response) => {
  const { reactType, icon } = req.body;
  const shortId = req.params?.videoId;
  const userId = req.user?.id;

  const existingReaction = await Reaction.findOne({
    where: { userId, shortId },
  });

  if (existingReaction) {
    if (!reactType && !icon) {
      await existingReaction.destroy();
    }
    else {
      await existingReaction.update({
        reactType: reactType || null,
        icon: icon || null,
      });
    }
  }
  else {
    await Reaction.create({ userId, shortId, reactType, icon });
  }

  const postWithStats = await Short.findOne({
    where: { id: shortId },
    attributes: {
      include: [
        getTotalReactionsCountLiteral("\"Short\"", "shortId"),
        getUserReactionLiteral(userId, "\"Short\"", "shortId"),
      ],
    },
  });

  if (!postWithStats)
    throw new ApiError(404, "Post not found");
  const receiverId = Number(postWithStats.userId);

  if (userId !== receiverId) {
    let notification = await Notification.findOne({
      where: {
        senderId: userId,
        receiverId,
        shortId,
        type: "like",
      },
    });

    if (notification) {
      await notification.update({
        icon,
        isRead: false,
        updatedAt: new Date(),
      });
    }
    else {
      notification = await Notification.create({
        senderId: userId,
        receiverId,
        type: "shortLike",
        icon,
        shortId,
      });
    }

    emitSocketEvent({
      req,
      roomId: `user:${receiverId}`,
      event: SocketEventEnum.NOTIFY_USER,
      payload: {
        ...notification.toJSON(),
        sender: {
          avatar: req.user?.avatar,
          fullName: req.user.fullName,
        },
      },
    });
  }

  const postData = postWithStats.toJSON();

  emitSocketEvent({
    req,
    roomId: `short_${shortId}`,
    event: SocketEventEnum.SHORT_REACT,
    payload: { postData, postId: Number(shortId) },
  });

  await DELETE_SHORT_CACHE();
  await NOTIFICATION_CACHE(userId);
  await invalidateUserShortsCache(req.user.id);

  return res.json(new ApiResponse(200, postData, "React Successfully"));
});

export const getMyShorts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const cacheKey = `user:${userId}:shorts:page:${page}:limit:${limit}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "Shorts fetched from cache"));
  }

  // Query shorts
  const { rows: shorts, count } = await Short.findAndCountAll({
    where: {
      userId,
      isPublic: true,
    },
    attributes: {
      include: [
        // [
        //   literal(`(SELECT COUNT(*) FROM "views" WHERE "views"."shortId" = "Short"."id")`),
        //   "viewsCount",
        // ],
        [
          literal(`(SELECT COUNT(*) FROM "comments" WHERE "comments"."shortId" = "Short"."id")`),
          "commentsCount",
        ],
        [
          literal(`(SELECT COUNT(*) FROM "reactions" WHERE "reactions"."shortId" = "Short"."id")`),
          "reactionsCount",
        ],
      ],
    },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const data = {
    shorts,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 60 * 10);

  return res.json(new ApiResponse(200, data, "My Shorts fetched successfully"));
});

export const getMyLives = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const cacheKey = `user:${userId}:lives:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "Lives fetched from cache"));
  }

  const { rows: lives, count } = await LiveStream.findAndCountAll({
    where: { userId },
    attributes: {
      include: [
        // [literal(`(SELECT COUNT(*) FROM "views" WHERE "views"."liveId" = "Live"."id")`), "viewsCount"],
        // [literal(`(SELECT COUNT(*) FROM "comments" WHERE "comments"."liveId" = "Live"."id")`), "commentsCount"],
        // [literal(`(SELECT COUNT(*) FROM "reactions" WHERE "reactions"."liveId" = "Live"."id")`), "reactionsCount"],
      ],
    },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const data = {
    lives,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 60 * 10);

  return res.json(new ApiResponse(200, data, "My Lives fetched successfully"));
});

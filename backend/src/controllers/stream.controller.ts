import sequelize from "@/config/db";
import {
  generateLiveKitToken,
  generateLiveToken,
  roomServiceClient,
} from "@/config/livekit";
import redis from "@/config/redis";
import { SocketEventEnum } from "@/constants";
import { LiveStream, User } from "@/models";
import StreamChatConversation from "@/models/stream-chat.models";
import { emitSocketEvent } from "@/socket";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";

export const generate_livekit_token = asyncHandler(
  async (req: Request, res: Response) => {
    const { roomName, identity } = req.query;
    if (typeof roomName !== "string" || typeof identity !== "string")
      throw new ApiError(400, "roomName and identity are required");
    const { token, livekitUrl } = await generateLiveKitToken(
      identity,
      roomName,
      req.user.avatar,
      req.user.full_name
    );

    return res.json(new ApiResponse(200, { token, livekitUrl }, "Success"));
  }
);

export const initiate_call = asyncHandler(
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
      60
    );

    const socket = req.app.get("io");

    socket.to(`user:${receiverId}`).emit(SocketEventEnum.INCOMING_CALL, {
      from: user?.id,
      authToken: authToken,
      callType: callType,
      roomName: roomName,
      callerName: user?.full_name,
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
            message: `${receiverUser?.full_name} didn't answer your call.`,
            callerName: receiverUser?.full_name,
            callerAvatar: receiverUser?.avatar,
          });
          socket.to(`user:${receiverId}`).emit(SocketEventEnum.CALL_TIMEOUT, {
            roomName,
            reason: "NO_ANSWER",
            message: "You missed a call.",
            callerName: user?.full_name,
            callerAvatar: user?.avatar,
          });
          await redis.del(`call:${roomName}`);
          await redis.del(`call-token:${roomName}:${authToken}`);
        }
      }
    }, 50000);

    res.status(200).json(new ApiResponse(200, null, "Call initialized"));
  }
);

export const validate_call_token = asyncHandler(
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
      String(userId) !== String(callerId) &&
      String(userId) !== String(receiverId)
    ) {
      throw new ApiError(403, "You are not authorized to join this call");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Token and user validated"));
  }
);

export const start_live_stream = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      tags,
      enable_chat,
      save_recording,
      notify_followers,
    } = req.body;

    const userId = req.user.id;
    const roomName = `live_${req.user.username}_${Date.now()}`;

    const stream = await LiveStream.create({
      user_id: userId,
      title,
      description,
      category,
      tags,
      enable_chat,
      save_recording,
      notify_followers,
      room_name: roomName,
      is_active: true,
      started_at: new Date(),
    });

    const token = generateLiveToken({
      roomName,
      userId: String(userId),
      userName: req.user.full_name,
      isPublisher: true,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { roomName, token, stream }, "Stream started")
      );
  }
);

export const start_chat_live_stream = asyncHandler(
  async (req: Request, res: Response) => {
    const { stream_id, sender_id, content } = req.body;

    const stream = await LiveStream.findOne({ where: { id: stream_id}})
    if(!stream) throw new ApiError(404, 'Live Stream Not Found')
    if(!stream?.enable_chat) throw new ApiError(400, 'For this live stream chat is disabled')

    const message = await StreamChatConversation.create({
      stream_id,
      sender_id,
      content,
    });

    const fullMessage = await StreamChatConversation.findByPk(message.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "avatar"] },
      ],
    });

    emitSocketEvent({
      req,
      roomId: `live_stream_${stream_id}`,
      event: SocketEventEnum.LIVE_CHAT_SEND,
      payload: fullMessage,
    });

    return res.json(
      new ApiResponse(200, fullMessage, "Stream details fetched successfully")
    );
  }
);

export const stream_details = asyncHandler(
  async (req: Request, res: Response) => {
    const { streamId } = req.query;

    if (!streamId) {
      throw new ApiError(400, "streamId is required");
    }

    const stream = await LiveStream.findOne({
      where: { id: streamId, is_active: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "username",
            "full_name",
            "avatar",
            [
              sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "follows"
                        WHERE "follows"."followingId" = "user"."id"
                        )`),
              "followerCount",
            ],
          ],
        },
      ],
    });

    if (!stream) {
      throw new ApiError(404, "Stream not found");
    }

    const token = await generateLiveToken({
      roomName: stream.room_name,
      userId: String(req.user.id),
      userName: req.user?.full_name,
      isPublisher: stream.user_id === req.user.id,
    });

    return res.json(
      new ApiResponse(
        200,
        { stream, token, livekitUrl: process.env.LIVEKIT_URL },
        "Stream details fetched successfully"
      )
    );
  }
);

export const get_stream_chats = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) ?? 1;
    const limit = parseInt(req.query.limit as string) ?? 50;
    const skip = (page - 1) * limit;
    const streamId = req.query?.streamId;

    const { count, rows} = await StreamChatConversation.findAndCountAll({
      where: { stream_id: streamId },
      limit,
      offset: skip,
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "full_name", "avatar"],
        },
      ],
    });

    return res.json(
      new ApiResponse(
        200,
        {
          messages: rows,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        },
        "Stream message fetched successfully"
      )
    );
  }
);

export const get_active_lives = asyncHandler(
  async (req: Request, res: Response) => {
    const streams = await LiveStream.findAll({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "full_name", "avatar"],
        },
      ],
      order: [["started_at", "DESC"]],
    });

    return res
      .status(200)
      .json(new ApiResponse(200, streams, "Active live streams"));
  }
);

export const end_live_stream = asyncHandler(
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

    if (stream.user_id !== hostId) {
      throw new ApiError(403, "You are not authorized to end this stream");
    }

    await stream.update({
      is_active: false,
      ended_at: new Date(),
    });

    await StreamChatConversation.destroy({
      where: { stream_id: streamId },
    });

    await roomServiceClient
      .deleteRoom(stream.room_name)
      .then(() =>
        console.log(`LiveKit room '${stream.room_name}' deleted successfully.`)
      )
      .catch((error) => console.log("Room delete error", error));

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
        new ApiResponse(200, null, "Stream ended and room deleted successfully")
      );
  }
);

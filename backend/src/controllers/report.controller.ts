import type { Request, Response } from "express";

import redis from "@/config/redis";
import { SocketEventEnum } from "@/constants";
import { LiveStream, LiveStreamBan, Report } from "@/models";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import { uploadFileOnCloudinary } from "@/utils/cloudinary";

export const createReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, reportedId, reason, streamId } = req.body;

    if (streamId) {
      const existingReport = await Report.findOne({
        where: {
          reporterId: req.user.id,
          reportedId,
          type,
        },
      });

      if (existingReport)
        throw new ApiError(400, "You have already reported this item");
    }

    const attachments: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await uploadFileOnCloudinary(
          file.path,
          "ummah_connect/reports",
        );
        if (result?.url) {
          attachments.push(result.url);
        }
      }
    }

    const report = await Report.create({
      type,
      reportedId,
      reason,
      reporterId: req.user.id,
    });

    if (streamId) {
      await redis.incr(`report:stream:${streamId}:user:${reportedId}`);
      await redis.expire(`report:stream:${streamId}:user:${reportedId}`, 600);
      const count = await redis.get(`report:stream:${streamId}:user:${reportedId}`);

      if (Number.parseInt(count ?? "0") >= 3) {
        const socket = req.app.get("io");
        socket.to(`user:${reportedId}`).emit(SocketEventEnum.USER_KICK_FROM_LIVE, { message: "You are banned from this live stream.", status: 429 });
      }
    }

    return res.json(
      new ApiResponse(201, report, "Report submitted successfully"),
    );
  },
);

export const banViewer = asyncHandler(async (req: Request, res: Response) => {
  const { id: streamId } = req.params;
  const { bannedUserId, reason, durationType } = req.body;
  const hostId = req.user.id;

  const stream = await LiveStream.findOne({ where: { id: streamId, isActive: true } });
  if (!stream || stream.userId !== hostId) {
    throw new ApiError(403, "Only the host can ban users.");
  }

  let banDuration: number | null;

  switch (durationType) {
    case "current":
      banDuration = 0;
      break;
    case "24h":
      banDuration = 60 * 60 * 24;
      break;
    case "permanent":
      banDuration = null;
      break;
    default:
      throw new ApiError(400, "Invalid ban duration type.");
  }

  await LiveStreamBan.create({
    streamId,
    bannedUserId,
    bannedById: hostId,
    reason,
    banDuration,
  });

  const socket = req.app.get("io");
  socket.to(`user:${bannedUserId}`).emit(SocketEventEnum.BAN_VIEWER_FROM_MY_LIVE_STREAM, { message: "You are banned from this live stream.", status: 429 });

  res.json(new ApiResponse(200, null, "Viewer banned successfully"));
});

import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { LiveStream, LiveStreamBan, Report } from "@/models";
import {uploadFileOnCloudinary} from "@/utils/cloudinary";
import { sendEmail } from "@/utils/send-email";
import redis from "@/config/redis";
import { SocketEventEnum } from "@/constants";

export const create_report = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, reported_id, reason, stream_id } = req.body;

    if (stream_id) {
      const existingReport = await Report.findOne({
        where: {
          reporter_id: req.user.id,
          reported_id,
          stream_id,
          type,
        },
      });

      if (existingReport) throw new ApiError(400, "You have already reported this item");
    }


    let attachments: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await uploadFileOnCloudinary(
          file.path,
          "ummah_connect/reports"
        );
        if (result?.url) {
          attachments.push(result.url);
        }
      }
    }

    const report = await Report.create({
      type,
      reported_id,
      reason,
      reporter_id: req.user.id,
      stream_id
    });

    if (stream_id) {
      await redis.incr(`report:stream:${stream_id}:user:${reported_id}`);
      await redis.expire(`report:stream:${stream_id}:user:${reported_id}`, 600);
      const count = await redis.get(`report:stream:${stream_id}:user:${reported_id}`);

      if (parseInt(count ?? '0') >= 3) {
        const socket = req.app.get("io");
        socket.to(`user:${reported_id}`).emit(SocketEventEnum.USER_KICK_FROM_LIVE, { message: 'You are banned from this live stream.', status: 429 });
      }
    }

    return res.json(
      new ApiResponse(201, report, "Report submitted successfully")
    );
  }
);


export const ban_viewer = asyncHandler(async(req:Request, res:Response) =>{
  const { id: streamId } = req.params;
  const { banned_user_id, reason, duration_type} = req.body;
  const hostId = req.user.id;

  const stream = await LiveStream.findOne({ where: { id: streamId, is_active: true}});
  if (!stream || stream.user_id !== hostId) {
    throw new ApiError(403, "Only the host can ban users.");
  }

  let ban_duration: number | null;

  switch (duration_type) {
    case "current":
      ban_duration = 0;
      break;
    case "24h":
      ban_duration = 60 * 60 * 24;
      break;
    case "permanent":
      ban_duration = null;
      break;
    default:
      throw new ApiError(400, "Invalid ban duration type.");
  }

  await LiveStreamBan.create({
    stream_id:streamId,
    banned_user_id,
    banned_by_id: hostId,
    reason,
    ban_duration
  });

  const socket = req.app.get("io");
  socket.to(`user:${banned_user_id}`).emit(SocketEventEnum.BAN_VIEWER_FROM_MY_LIVE_STREAM, { message: 'You are banned from this live stream.', status: 429 });

  res.json(new ApiResponse(200, null, "Viewer banned successfully"));
})
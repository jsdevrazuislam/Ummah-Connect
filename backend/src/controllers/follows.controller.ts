import type { Request, Response } from "express";

import { DELETE_POST_CACHE } from "@/controllers/post.controller";
import { Follow } from "@/models";
import { NotificationType } from "@/models/notification.models";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import { createAndInvalidateNotification } from "@/utils/notification";

export const followUnFollow = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = Number(req.params.id);
  const currentUserId = req.user.id;

  if (currentUserId === targetUserId)
    throw new ApiError(400, "You can't follow yourself");

  const [follow, created] = await Follow.findOrCreate({
    where: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  if (!created) {
    await Follow.destroy({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    return res.json(new ApiResponse(200, null, "Unfollowed successfully"));
  }

  if (currentUserId !== targetUserId) {
    await createAndInvalidateNotification({
      req,
      senderId: currentUserId,
      receiverId: targetUserId,
      type: NotificationType.FOLLOW,
      postId: targetUserId || null,
    });
  }

  await DELETE_POST_CACHE();

  return res.json(
    new ApiResponse(200, follow, "Followed Successfully"),
  );
});

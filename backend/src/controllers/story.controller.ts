import redis from "@/config/redis";
import { Follow, Story, User } from "@/models";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import cloudinary from "@/utils/cloudinary";
import { Request, Response } from "express";
import { Op } from "sequelize";
import fs from "fs";
import ApiError from "@/utils/ApiError";


export const STORY_CACHE_KEY = (userId: string | number) => `stories:user:${userId}`;


export const uploadStory = asyncHandler(async (req: Request, res: Response) => {
    const { caption, background, type, textColor } = req.body;
    const userId = req.user.id;
    const file = req.file;
    let mediaUrl: string | null = null

    if (file) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
            resource_type: 'image',
            folder: 'ummah_connect/stories',
        });

        mediaUrl = uploaded.url
        fs.unlinkSync(file.path);
    }


    const story = await Story.create({ userId, mediaUrl, caption, background, type, textColor, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    await redis.del(STORY_CACHE_KEY(userId));
    res.json(new ApiResponse(200, story, "Story uploaded"));
});

export const getActiveStories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const cacheKey = STORY_CACHE_KEY(userId);

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.json(new ApiResponse(200, JSON.parse(cachedData), "Stories fetched (cached)"));
  }

  const following = await Follow.findAll({
    where: { followerId: userId },
    attributes: ["followingId"],
  });

  const followingIds = following.map((f) => f.followingId);
  const userAndFollowingIds = [...new Set([...followingIds, userId])];

  const stories = await User.findAll({
    where: { id: { [Op.in]: userAndFollowingIds } },
    attributes: ["id", "username", "avatar", "full_name"],
    include: [
      {
        model: Story,
        as: "stories",
        where: {
          expiresAt: { [Op.gt]: new Date() },
        },
        required: true,
        order: [["createdAt", "DESC"]],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  await redis.setex(cacheKey, 300, JSON.stringify(stories));

  return res.json(new ApiResponse(200, stories, "Stories fetched"));
});

export const deleteStory = asyncHandler(async (req: Request, res: Response) => {
  const storyId = parseInt(req.params.id);
  const userId = req.user.id;

  const story = await Story.findByPk(storyId);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (story.userId !== userId) {
    throw new ApiError(403, "You are not authorized to delete this story");
  }

  await story.destroy();

  await redis.del(STORY_CACHE_KEY(userId));

  return res.json(new ApiResponse(200, null, "Story deleted successfully"));
});


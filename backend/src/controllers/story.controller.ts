import redis from "@/config/redis";
import { Follow, Story, User } from "@/models";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import cloudinary from "@/utils/cloudinary";
import { Request, Response } from "express";
import { Op } from "sequelize";
import fs from "fs";


const STORY_CACHE_KEY = (userId: string | number) => `stories:user:${userId}`;


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

    const story = await Story.create({ userId, mediaUrl, caption, background, type, textColor });
    await redis.del(STORY_CACHE_KEY(userId));
    res.json(new ApiResponse(200, story, "Story uploaded"));
});

export const getActiveStories = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const cacheKey = STORY_CACHE_KEY(userId);

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        return res.json(new ApiResponse(200, JSON.parse(cachedData), 'Stories fetched (cached)'));
    }


    const following = await Follow.findAll({
        where: { followerId: userId },
        attributes: ["followingId"],
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
        return res.json(new ApiResponse(200, [], "No active stories"));
    }

    const stories = await User.findAll({
        where: { id: { [Op.in]: [followingIds, req.user.id] } },
        attributes: ['id', 'username', 'avatar', 'full_name'],
        include: [
            {
                model: Story,
                where: {
                    createdAt: { [Op.gte]: twentyFourHoursAgo },
                },
                required: true,
                order: [['createdAt', 'DESC']],
                as: 'stories'
            },
        ],
        order: [['stories', 'createdAt', 'DESC']],
    });

    await redis.setex(cacheKey, 300, JSON.stringify(stories));

    res.json(new ApiResponse(200, stories, "Stories fetched"));
});


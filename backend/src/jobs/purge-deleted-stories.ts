import redis from "@/config/redis";
import { Story } from "@/models";
import { Op } from "sequelize";

export const purgeExpiredStories = async () => {
    const now = new Date();

    const expiredStories = await Story.findAll({
        where: {
            expiresAt: { [Op.lte]: now },
        },
    });

    for (const story of expiredStories) {
        await redis.del(`stories:user:${story.userId}`);
        await story.destroy();
    }

    console.log(`[PurgeStoriesJob] Deleted ${expiredStories.length} expired stories`);
};

import { Op } from "sequelize";

import redis from "@/config/redis";
import { Story } from "@/models";

export async function purgeExpiredStories() {
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
}

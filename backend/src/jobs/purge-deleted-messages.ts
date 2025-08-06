import { Op } from "sequelize";

import { Message, User } from "@/models";

export async function purgeDeletedMessages() {
  const deletedMessages = await Message.findAll({
    where: { isDeleted: true },
    attributes: ["id"],
  });

  for (const msg of deletedMessages) {
    await msg.destroy();
  }

  console.log(`[PurgeMessagesJob] Deleted ${deletedMessages.length} soft-deleted messages`);
}

export async function hardDeleteOldAccounts() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const usersToDelete = await User.findAll({
    where: {
      isDeleteAccount: true,
      deletedAt: { [Op.lt]: thirtyDaysAgo },
    },
  });

  console.log(`Deleted ${usersToDelete.length} users permanently.`);
}

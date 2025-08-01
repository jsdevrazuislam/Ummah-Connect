import { Message } from "@/models";

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

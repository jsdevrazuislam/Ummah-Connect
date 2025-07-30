import { Message } from "@/models";

export const purgeDeletedMessages = async () => {
    const deletedMessages = await Message.findAll({
        where: { is_deleted: true },
        attributes: ['id'],
    });

    for (const msg of deletedMessages) {
        await msg.destroy();
    }

    console.log(`[PurgeMessagesJob] Deleted ${deletedMessages.length} soft-deleted messages`);
};

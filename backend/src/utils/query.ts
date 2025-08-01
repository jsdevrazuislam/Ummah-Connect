import { Op } from "sequelize";

import { ConversationParticipant } from "@/models";

/**
 * Get all users who share a conversation with the given user.
 * @param userId Current user ID
 */
export async function getConversationUserIds(userId: number): Promise<number[]> {
  const conversations = await ConversationParticipant.findAll({
    where: { userId },
    attributes: ["conversationId"],
  });

  const conversationIds = conversations.map(c => c.conversationId);

  if (conversationIds.length === 0)
    return [];

  const participants = await ConversationParticipant.findAll({
    where: {
      conversationId: { [Op.in]: conversationIds },
      userId: { [Op.ne]: userId },
    },
    attributes: ["userId"],
    group: ["userId"],
  });

  return participants.map(p => p.userId);
}

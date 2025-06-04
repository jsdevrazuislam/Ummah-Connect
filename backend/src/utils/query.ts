import { ConversationParticipant } from '@/models';
import { Op } from 'sequelize';

/**
 * Get all users who share a conversation with the given user.
 * @param userId Current user ID
 */
export const getConversationUserIds = async (userId: number): Promise<number[]> => {
  const conversations = await ConversationParticipant.findAll({
    where: { user_id: userId },
    attributes: ['conversation_id'],
  });

  const conversationIds = conversations.map(c => c.conversation_id);

  if (conversationIds.length === 0) return [];

  const participants = await ConversationParticipant.findAll({
    where: {
      conversation_id: { [Op.in]: conversationIds },
      user_id: { [Op.ne]: userId }, 
    },
    attributes: ['user_id'],
    group: ['user_id'] 
  });

  return participants.map(p => p.user_id);
};

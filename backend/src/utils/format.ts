import { ConversationParticipant } from "@/models";

export const formatConversations = (conversations: ConversationParticipant[]) => {

  const plainConversations = conversations?.map(conversation => conversation.get({ plain: true }));

  const data = plainConversations?.map((participant) => {
    if (!participant.conversation) return null

    const conversation = participant.conversation

    let displayName = conversation.name
    let avatar = null
    let userId = null
    let username = null
    let status = null
    let last_seen_at = null
    let public_key = null
    if (conversation.type === 'private' && conversation.participants && conversation?.participants?.length > 0) {
      const otherParticipant = conversation.participants[0].user
      displayName = otherParticipant.full_name
      userId = otherParticipant.id
      username = otherParticipant.username
      avatar = otherParticipant.avatar
      status = otherParticipant?.status
      last_seen_at = otherParticipant.last_seen_at
      public_key = otherParticipant.public_key
    }


    return {
      id: conversation.id,
      type: conversation.type,
      name: displayName,
      userId,
      username,
      status,
      avatar,
      last_seen_at,
      public_key,
      lastMessage: conversation.lastMessage ? {
        id: conversation.lastMessage.id,
        sender: conversation.lastMessage.sender ? {
          id: conversation.lastMessage.sender.id,
          username: conversation.lastMessage.sender.username,
          full_name: conversation.lastMessage.sender.full_name,
          avatar: conversation.lastMessage.sender.avatar,
          last_seen_at: conversation.lastMessage?.sender?.last_seen_at
        } : null,
        content: conversation.lastMessage.content,
        key_for_sender: conversation.lastMessage.key_for_sender,
        key_for_recipient: conversation.lastMessage.key_for_recipient,
        type: conversation.lastMessage.type,
        sent_at: conversation.lastMessage.sent_at,
      } : null,
      unreadCount: participant.unread_count,
      isMuted: participant.is_muted,
      createdAt: conversation?.createdAt
    };
  })

  return data?.filter(Boolean)
}
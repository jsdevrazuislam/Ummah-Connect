import type { ConversationParticipant } from "@/models";

export function formatConversations(conversations: ConversationParticipant[]) {
  const plainConversations = conversations?.map(conversation => conversation.get({ plain: true }));

  const data = plainConversations?.map((participant) => {
    if (!participant.conversation)
      return null;

    const conversation = participant.conversation;

    let displayName = conversation.name;
    let avatar = null;
    let userId = null;
    let username = null;
    let status = null;
    let lastSeenAt = null;
    let publicKey = null;
    if (conversation.type === "private" && conversation.participants && conversation?.participants?.length > 0) {
      const otherParticipant = conversation.participants[0].user;
      displayName = otherParticipant.fullName;
      userId = otherParticipant.id;
      username = otherParticipant.username;
      avatar = otherParticipant.avatar;
      status = otherParticipant?.status;
      lastSeenAt = otherParticipant.lastSeenAt;
      publicKey = otherParticipant.publicKey;
    }

    return {
      id: conversation.id,
      type: conversation.type,
      name: displayName,
      userId,
      username,
      status,
      avatar,
      lastSeenAt,
      publicKey,
      lastMessage: conversation.lastMessage
        ? {
            id: conversation.lastMessage.id,
            sender: conversation.lastMessage.sender
              ? {
                  id: conversation.lastMessage.sender.id,
                  username: conversation.lastMessage.sender.username,
                  fullName: conversation.lastMessage.sender.fullName,
                  avatar: conversation.lastMessage.sender.avatar,
                  lastSeenAt: conversation.lastMessage?.sender?.lastSeenAt,
                }
              : null,
            content: conversation.lastMessage.content,
            keyForSender: conversation.lastMessage.keyForSender,
            keyForRecipient: conversation.lastMessage.keyForRecipient,
            type: conversation.lastMessage.type,
            sentAt: conversation.lastMessage.sentAt,
          }
        : null,
      unreadCount: participant.unreadCount,
      isMuted: participant.isMuted,
      createdAt: conversation?.createdAt,
    };
  });

  return data?.filter(Boolean);
}

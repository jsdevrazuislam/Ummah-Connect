export function addMessageConversation(oldData: QueryOldDataPayloadConversation | undefined, data: ConversationMessages, conversationId: number) {
  if (!oldData || !conversationId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldAddMessage
      = existingConversation.length === 0
        || existingConversation.some(c => c.conversationId === conversationId);

    if (shouldAddMessage) {
      return {
        ...page,
        data: {
          ...page.data,
          messages: [...existingConversation, data],
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function addedConversation(oldData: QueryOldDataPayloadConversations | undefined, data: Conversation, conversationId: number) {
  if (!oldData)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldAddMessage
      = existingConversation.length === 0
        || existingConversation.some(c => c.id === conversationId);

    if (shouldAddMessage) {
      return {
        ...page,
        data: {
          ...page.data,
          conversations: [...existingConversation, data],
        },
      };
    }

    return {
      ...page,
      data: {
        ...page.data,
        conversations: [data, ...existingConversation],
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function removeConversation(oldData: QueryOldDataPayloadConversations | undefined, conversationId: number): QueryOldDataPayloadConversations | undefined {
  if (!oldData)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversations = page?.data?.conversations ?? [];

    return {
      ...page,
      data: {
        ...page.data,
        conversations: existingConversations.filter(
          c => c.id !== conversationId,
        ),
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function updatedUnReadCount(oldData: QueryOldDataPayloadConversations | undefined, conversationId: number) {
  if (!oldData)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldUpdateUnreadCount = existingConversation.some(
      c => c.id === conversationId,
    );

    if (shouldUpdateUnreadCount) {
      const updateConversation = existingConversation?.map((conversation) => {
        return {
          ...conversation,
          unreadCount: 0,
        };
      });
      return {
        ...page,
        data: {
          ...page.data,
          conversations: updateConversation,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function addLastMessage(oldData: QueryOldDataPayloadConversations | undefined, conversationId: number, data: ConversationMessages) {
  if (!oldData)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldUpdateUnreadCount = existingConversation.some(
      c => c.id === conversationId,
    );

    if (shouldUpdateUnreadCount) {
      const updateConversation = existingConversation?.map((conversation) => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            lastMessage: {
              ...conversation.lastMessage,
              id: data?.id,
              keyForRecipient: data?.keyForRecipient,
              keyForSender: data?.keyForSender,
              content: data.content,
              sentAt: data.sentAt,
              sender: {
                ...data.sender,
              },
            },
          };
        }

        return conversation;
      });
      return {
        ...page,
        data: {
          ...page.data,
          conversations: updateConversation,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function addUnReadCount(oldData: QueryOldDataPayloadConversations | undefined, conversationId: number) {
  if (!oldData)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldUpdateUnreadCount = existingConversation.some(
      c => c.id === conversationId,
    );

    if (shouldUpdateUnreadCount) {
      const updateConversation = existingConversation?.map((conversation) => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            unreadCount: conversation.unreadCount + 1,
          };
        }

        return conversation;
      });
      return {
        ...page,
        data: {
          ...page.data,
          conversations: updateConversation,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function replaceSendMessageInConversation(
  oldData: QueryOldDataPayloadConversation,
  id: number,
  newMessage: ConversationMessages | ((prev: ConversationMessages | undefined) => ConversationMessages | null),
  conversationId: number,
): QueryOldDataPayloadConversation {
  if (!oldData || !conversationId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingMessages = page?.data?.messages ?? [];

    const hasMessage = existingMessages.some(msg => msg.conversationId === conversationId && msg.id === id);
    if (!hasMessage)
      return page;

    const updatedMessages = existingMessages.map((msg) => {
      if (msg.id !== id)
        return msg;

      const updated
        = typeof newMessage === "function" ? (newMessage as (prev: ConversationMessages) => ConversationMessages | null)(msg) : newMessage;

      return updated ?? msg;
    });

    return {
      ...page,
      data: {
        ...page.data,
        messages: updatedMessages,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function replaceMessageInConversation(
  oldData: QueryOldDataPayloadConversation,
  id: number,
  newMessage: ConversationMessages,
  conversationId: number,
) {
  if (!oldData || !conversationId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldUpdateConversationMessage = existingConversation.some(
      c => c.conversationId === conversationId,
    );
    const updatedMessages = existingConversation.map(msg =>
      msg.id === id ? newMessage : msg,
    );

    if (shouldUpdateConversationMessage) {
      return {
        ...page,
        data: {
          ...page.data,
          messages: updatedMessages,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function updateParticipantCount(
  oldData: LiveStreamResponse,
  streamId: number,
  count: number,
) {
  if (!oldData)
    return oldData;

  const updatedData = oldData?.data?.map(stream =>
    stream.id === streamId ? { ...stream, viewers: count } : stream,
  );
  return {
    ...oldData,
    data: updatedData,
  };
}

export function addMessageConversationLiveStream(oldData: QueryOldDataPayloadLiveStreamChats | undefined, data: LiveStreamChatData, steamId: number) {
  if (!oldData || !steamId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldAddMessage = existingConversation?.length === 0 || existingConversation.some(c => c.streamId === steamId);

    if (shouldAddMessage) {
      return {
        ...page,
        data: {
          ...page.data,
          messages: [...existingConversation, data],
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function replaceMessageInConversationStream(
  oldData: QueryOldDataPayloadLiveStreamChats,
  id: number,
  newMessage: LiveStreamChatData,
  steamId: number,
) {
  if (!oldData || !steamId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldUpdateConversationMessage = existingConversation.some(c => c.streamId === steamId);
    const updatedMessages = existingConversation.map(msg => msg.id === id ? newMessage : msg);

    if (shouldUpdateConversationMessage) {
      return {
        ...page,
        data: {
          ...page.data,
          messages: updatedMessages,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function updateMessageReactionInConversation(
  oldData: QueryOldDataPayloadConversation,
  conversationId: number,
  messageId: number,
  newReaction: MessageReaction,
): QueryOldDataPayloadConversation {
  if (!oldData || !conversationId || !messageId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const messages = page?.data?.messages ?? [];

    const updatedMessages = messages.map((msg) => {
      if (msg.id !== messageId || msg.conversationId !== conversationId)
        return msg;

      const existingReactionIndex = msg.reactions.findIndex(
        reaction => reaction.userId === newReaction.userId,
      );

      let updatedReactions: MessageReaction[];

      if (existingReactionIndex !== -1) {
        updatedReactions = [...msg.reactions];
        updatedReactions[existingReactionIndex] = newReaction;
      }
      else {
        updatedReactions = [...msg.reactions, newReaction];
      }

      return {
        ...msg,
        reactions: updatedReactions,
      };
    });

    return {
      ...page,
      data: {
        ...page.data,
        messages: updatedMessages,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function removeMessageReactionInConversation(
  oldData: QueryOldDataPayloadConversation,
  conversationId: number,
  messageId: number,
  userId: number,
): QueryOldDataPayloadConversation {
  if (!oldData || !conversationId || !messageId || !userId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const messages = page?.data?.messages ?? [];

    const updatedMessages = messages.map((msg) => {
      if (msg.id !== messageId || msg.conversationId !== conversationId)
        return msg;

      const hasReactionFromUser = msg.reactions.some(
        reaction => reaction.userId === userId,
      );

      if (!hasReactionFromUser)
        return msg;

      const updatedReactions = msg.reactions.filter(
        reaction => reaction.userId !== userId,
      );

      return {
        ...msg,
        reactions: updatedReactions,
      };
    });

    return {
      ...page,
      data: {
        ...page.data,
        messages: updatedMessages,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function updateMessageContentInConversation(
  oldData: QueryOldDataPayloadConversation,
  conversationId: number,
  messageId: number,
  content: string,
  keyForRecipient: string,
  keyForSender: string,
): QueryOldDataPayloadConversation {
  if (!oldData || !conversationId || !messageId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const messages = page?.data?.messages ?? [];

    const updatedMessages = messages.map((msg) => {
      if (msg.id !== messageId || msg.conversationId !== conversationId)
        return msg;

      return {
        ...msg,
        content,
        keyForRecipient,
        keyForSender,
        isUpdated: true,
      };
    });

    return {
      ...page,
      data: {
        ...page.data,
        messages: updatedMessages,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function toggleMessageDeleteState(
  oldData: QueryOldDataPayloadConversation,
  conversationId: number,
  messageId: number,
  shouldDelete: boolean,
): QueryOldDataPayloadConversation {
  if (!oldData || !conversationId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const messages = page?.data?.messages ?? [];

    const index = messages.findIndex(
      msg => msg.id === messageId && msg.conversationId === conversationId,
    );

    if (index !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        isDeleted: shouldDelete,
      };

      return {
        ...page,
        data: {
          ...page.data,
          messages: updatedMessages,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function addMessageStatusToMessage(
  oldData: QueryOldDataPayloadConversation,
  conversationId: number,
  messageId: number,
  newStatus: MessageStatus,
): QueryOldDataPayloadConversation {
  if (!oldData || !conversationId || !messageId || !newStatus)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const messages = page?.data?.messages ?? [];

    const index = messages.findIndex(
      msg => msg.id === messageId && msg.conversationId === conversationId,
    );

    if (index !== -1) {
      const updatedMessages = [...messages];
      const message = updatedMessages[index];
      const oldStatuses = message.statuses || [];

      const statusIndex = oldStatuses.findIndex(s => s.id === newStatus.id);

      const updatedStatuses
        = statusIndex !== -1
          ? [
              ...oldStatuses.slice(0, statusIndex),
              newStatus,
              ...oldStatuses.slice(statusIndex + 1),
            ]
          : [...oldStatuses, newStatus];

      updatedMessages[index] = {
        ...message,
        statuses: updatedStatuses,
      };

      return {
        ...page,
        data: {
          ...page.data,
          messages: updatedMessages,
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

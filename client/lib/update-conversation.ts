
export const addMessageConversation = (
  oldData: QueryOldDataPayloadConversation | undefined,
  data: ConversationMessages,
  conversationId: number
) => {
  if (!oldData || !conversationId) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldAddMessage =
      existingConversation.length === 0 ||
      existingConversation.some((c) => c.conversation_id === conversationId);

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
};

export const addedConversation = (
  oldData: QueryOldDataPayloadConversations | undefined,
  data: Conversation,
  conversationId: number
) => {
  if (!oldData) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldAddMessage =
      existingConversation.length === 0 ||
      existingConversation.some((c) => c.id === conversationId);

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
};

export const updatedUnReadCount = (
  oldData: QueryOldDataPayloadConversations | undefined,
  conversationId: number
) => {
  if (!oldData) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldUpdateUnreadCount = existingConversation.some(
      (c) => c.id === conversationId
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
};

export const addLastMessage = (
  oldData: QueryOldDataPayloadConversations | undefined,
  conversationId: number,
  data: ConversationMessages
) => {
  if (!oldData) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldUpdateUnreadCount = existingConversation.some(
      (c) => c.id === conversationId
    );

    if (shouldUpdateUnreadCount) {
      const updateConversation = existingConversation?.map((conversation) => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            lastMessage: {
              ...conversation.lastMessage,
              content: data.content,
              sent_at: data.sent_at,
              sender:{
                ...data.sender
              }
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
};


export const addUnReadCount = (
  oldData: QueryOldDataPayloadConversations | undefined,
  conversationId: number,
) => {
  if (!oldData) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.conversations ?? [];
    const shouldUpdateUnreadCount = existingConversation.some(
      (c) => c.id === conversationId
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
};

export function replaceMessageInConversation(
  oldData: QueryOldDataPayloadConversation,
  id: number,
  newMessage: ConversationMessages,
  conversationId: number
) {
  if (!oldData || !conversationId) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldUpdateConversationMessage = existingConversation.some(
      (c) => c.conversation_id === conversationId
    );
    const updatedMessages = existingConversation.map((msg) =>
      msg.id === id ? newMessage : msg
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
  count: number
) {
  if (!oldData) return oldData;

  const updatedData = oldData?.data?.map((stream) =>
    stream.id === streamId ? { ...stream, viewers: count } : stream
  );
  return {
    ...oldData,
    data: updatedData,
  };
}

export const addMessageConversationLiveStream = (
  oldData: QueryOldDataPayloadLiveStreamChats | undefined,
  data: LiveStreamChatData,
  steamId: number
) => {
  if (!oldData || !steamId) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldAddMessage = existingConversation?.length === 0 || existingConversation.some((c) => c.stream_id === steamId);

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
};


export function replaceMessageInConversationStream(
  oldData: QueryOldDataPayloadLiveStreamChats,
  id: number,
  newMessage: LiveStreamChatData,
  steamId: number
) {
  if (!oldData || !steamId) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingConversation = page?.data?.messages ?? [];
    const shouldUpdateConversationMessage = existingConversation.some((c) => c.stream_id === steamId);
    const updatedMessages = existingConversation.map((msg) =>msg.id === id ? newMessage : msg);

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
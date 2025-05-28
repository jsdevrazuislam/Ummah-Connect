export const addMessageConversation = (
    oldData: QueryOldDataPayloadConversation | undefined,
    data: ConversationMessages,
    conversationId: number
) => {

    if (!oldData || !conversationId) return oldData;

    const updatedPages = oldData.pages.map((page) => {
        const existingConversation = page?.data?.messages ?? [];
        const shouldAddMessage = existingConversation.length === 0 || existingConversation.some((c) => c.conversation_id === conversationId);

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

export const addedConversation = (
    oldData: QueryOldDataPayloadConversations | undefined,
    data: Conversation,
    conversationId: number
) => {

    if (!oldData) return oldData;

    const updatedPages = oldData.pages.map((page) => {
        const existingConversation = page?.data?.conversations ?? [];
        const shouldAddMessage = existingConversation.length === 0 || existingConversation.some((c) => c.id === conversationId);

        if (shouldAddMessage) {
            return {
                ...page,
                data: {
                    ...page.data,
                    conversations: [...existingConversation, data],
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
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";


export const get_conversations = async ({ page = 1, limit = 10 }): Promise<ConversationResponse> => {
    const response = await api.get<ConversationResponse>(ApiStrings.GET_CONVERSATION, { params: { page, limit } });
    return response.data;
}

export const get_conversation_messages = async ({ page = 1, limit = 20, id = 0 }): Promise<ConversationMessagesResponse> => {
    const response = await api.get<ConversationMessagesResponse>(ApiStrings.GET_CONVERSATION_MESSAGE(id), { params: { page, limit } });
    return response.data;
}

export const send_message = async (payload: SendMessagePayload) => {
    const response = await api.post(ApiStrings.SEND_MESSAGE, payload);
    return response.data;
}
export const create_conversation = async (payload: CreateConversationPayload) => {
    const response = await api.post(ApiStrings.CREATE_CONVERSATION, payload);
    return response.data;
}

export const read_message = async (payload: ReadMessagePayload) => {
    const response = await api.post(ApiStrings.READ_MESSAGE, payload);
    return response.data;
}
export const delete_conversation = async (id: number) => {
    const response = await api.delete(`${ApiStrings.DELETE_CONVERSATION}/${id}`);
    return response.data;
}
export const react_to_message = async (payload: ReactionToMessagePayload) => {
    const response = await api.post(`${ApiStrings.REACT_MESSAGE}/${payload.id}`, { emoji: payload.emoji });
    return response.data;
}
export const remove_reaction_from_message = async (id: number) => {
    const response = await api.delete(`${ApiStrings.REACT_MESSAGE}/${id}`);
    return response.data;
}
export const edit_message = async (payload: ReplyToMessagePayload) => {
    const response = await api.put(`${ApiStrings.EDIT_MESSAGE}/${payload.id}`, { content:payload.content, key_for_recipient: payload.key_for_recipient, key_for_sender: payload.key_for_sender});
    return response.data;
}
export const delete_message = async (id: number) => {
    const response = await api.delete(`${ApiStrings.DELETE_MESSAGE}/${id}`);
    return response.data;
}
export const undo_delete_message = async (id: number) => {
    const response = await api.post(`${ApiStrings.UNDO_DELETE_MESSAGE}/${id}`);
    return response.data;
}
export const reply_to_message = async (payload: ReplyToMessagePayload) => {
    const response = await api.post(`${ApiStrings.REPLY_MESSAGE}/${payload.id}`, { content: payload.content, key_for_sender: payload.key_for_sender, key_for_recipient: payload.key_for_recipient, receiver_id: payload.receiver_id });
    return response.data;
}

export const send_attachment = async (payload: FormData) => {
    const response = await api.post(ApiStrings.SEND_ATTACHMENT, payload, {
        headers: {
            ...(payload instanceof FormData
                ? { "Content-Type": "multipart/form-data" }
                : {}),
        },
    });
    return response.data;
}

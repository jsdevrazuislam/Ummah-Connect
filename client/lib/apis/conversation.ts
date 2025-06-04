import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";


export const get_conversations = async ({ page=1, limit=10}) : Promise<ConversationResponse> => {
    const response = await api.get<ConversationResponse>(ApiStrings.GET_CONVERSATION, { params: { page, limit}});
    return response.data;
}

export const get_conversation_messages = async ({ page=1, limit=20, id = 0}) : Promise<ConversationMessagesResponse> => {
    const response = await api.get<ConversationMessagesResponse>(ApiStrings.GET_CONVERSATION_MESSAGE(id), { params: { page, limit}});
    return response.data;
}

export const send_message = async(payload:SendMessagePayload) =>{
    const response = await api.post(ApiStrings.SEND_MESSAGE, payload);
    return response.data;
}
export const create_conversation = async(payload:CreateConversationPayload) =>{
    const response = await api.post(ApiStrings.CREATE_CONVERSATION, payload);
    return response.data;
}

export const read_message = async(payload:ReadMessagePayload) =>{
    const response = await api.post(ApiStrings.READ_MESSAGE, payload);
    return response.data;
}

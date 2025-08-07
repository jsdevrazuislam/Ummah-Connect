import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export async function getConversations({ page = 1, limit = 10 }): Promise<ConversationResponse> {
  const response = await api.get<ConversationResponse>(ApiStrings.GET_CONVERSATION, { params: { page, limit } });
  return response.data;
}

export async function getConversationMessages({ page = 1, limit = 20, id = 0 }): Promise<ConversationMessagesResponse> {
  const response = await api.get<ConversationMessagesResponse>(ApiStrings.GET_CONVERSATION_MESSAGE(id), { params: { page, limit } });
  return response.data;
}

export async function sendMessage(payload: SendMessagePayload) {
  const response = await api.post(ApiStrings.SEND_MESSAGE, payload);
  return response.data;
}
export async function createConversation(payload: CreateConversationPayload) {
  const response = await api.post(ApiStrings.CREATE_CONVERSATION, payload);
  return response.data;
}

export async function readMessage(payload: ReadMessagePayload) {
  const response = await api.post(ApiStrings.READ_MESSAGE, payload);
  return response.data;
}
export async function deleteConversation(id: number) {
  const response = await api.delete(`${ApiStrings.DELETE_CONVERSATION}/${id}`);
  return response.data;
}
export async function reactToMessage(payload: ReactionToMessagePayload) {
  const response = await api.post(`${ApiStrings.REACT_MESSAGE}/${payload.id}`, { emoji: payload.emoji });
  return response.data;
}
export async function removeReactionFromMessage(id: number) {
  const response = await api.delete(`${ApiStrings.REACT_MESSAGE}/${id}`);
  return response.data;
}
export async function editMessage(payload: ReplyToMessagePayload) {
  const response = await api.put(`${ApiStrings.EDIT_MESSAGE}/${payload.id}`, { content: payload.content, keyForRecipient: payload.keyForRecipient, keyForSender: payload.keyForSender });
  return response.data;
}
export async function deleteMessage(id: number) {
  const response = await api.delete(`${ApiStrings.DELETE_MESSAGE}/${id}`);
  return response.data;
}
export async function undoDeleteMessage(id: number) {
  const response = await api.post(`${ApiStrings.UNDO_DELETE_MESSAGE}/${id}`);
  return response.data;
}
export async function replyToMessage(payload: ReplyToMessagePayload) {
  const response = await api.post(`${ApiStrings.REPLY_MESSAGE}/${payload.id}`, { content: payload.content, keyForSender: payload.keyForSender, keyForRecipient: payload.keyForRecipient, receiverId: payload.receiverId });
  return response.data;
}

export async function sendAttachment(payload: FormData) {
  const response = await api.post(ApiStrings.SEND_ATTACHMENT, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

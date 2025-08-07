import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export async function initializeCall(payload: CallInitialPayload) {
  const response = await api.post(ApiStrings.INITIAL_CALL, payload);
  return response.data;
}

export async function startLive(payload: StreamPayload): Promise<StartLiveStreamResponse> {
  const response = await api.post<StartLiveStreamResponse>(
    ApiStrings.START_LIVE,
    payload,
  );
  return response.data;
}

export async function endLive(streamId: number) {
  const response = await api.post(ApiStrings.END_LIVE, { streamId });
  return response.data;
}

export async function getStreams(): Promise<LiveStreamResponse> {
  const response = await api.get<LiveStreamResponse>(ApiStrings.GET_LIVES);
  return response.data;
}

export async function sendStreamMessage(payload: LiveStreamChatPayload) {
  const response = await api.post(ApiStrings.SEND_CHAT, payload);
  return response.data;
}

export async function banUser(payload: BanLivePayload) {
  const response = await api.post(ApiStrings.BAN_USER(payload.streamId), payload);
  return response.data;
}

export async function reportUser(payload: FormData) {
  const response = await api.post(ApiStrings.REPORT, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

export async function uploadShorts(payload: FormData): Promise<UploadShortsResponse> {
  const response = await api.post<UploadShortsResponse>(ApiStrings.UPLOAD_SHORT, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

export async function getStreamMessages({
  page = 1,
  limit = 50,
  streamId = 0,
}): Promise<LiveStreamChatsResponse> {
  const response = await api.get<LiveStreamChatsResponse>(
    ApiStrings.GET_CHATS,
    {
      params: { page, limit, streamId },
    },
  );
  return response.data;
}

export async function getShorts({
  page = 1,
  limit = 50,
}): Promise<ShortsResponse> {
  const response = await api.get<ShortsResponse>(
    ApiStrings.GET_SHORTS,
    {
      params: { page, limit },
    },
  );
  return response.data;
}

export async function postReactShort(payload: ReactPayload): Promise<ShortReactResponse> {
  const response = await api.post<ShortReactResponse>(`${ApiStrings.REACT_SHORT}/${payload.id}`, { reactType: payload.reactType, icon: payload.icon });
  return response.data;
}

export async function deleteStory(id: number) {
  const response = await api.delete(`${ApiStrings.DELETE_STORY}/${id}`);
  return response.data;
}

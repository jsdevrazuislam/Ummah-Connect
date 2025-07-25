import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const initialize_call = async (payload: CallInitialPayload) => {
  const response = await api.post(ApiStrings.INITIAL_CALL, payload);
  return response.data;
};

export const start_live = async (
  payload: StreamPayload
): Promise<StartLiveStreamResponse> => {
  const response = await api.post<StartLiveStreamResponse>(
    ApiStrings.START_LIVE,
    payload
  );
  return response.data;
};

export const end_live = async (streamId: number) => {
  const response = await api.post(ApiStrings.END_LIVE, { streamId });
  return response.data;
};

export const get_streams = async (): Promise<LiveStreamResponse> => {
  const response = await api.get<LiveStreamResponse>(ApiStrings.GET_LIVES);
  return response.data;
};

export const send_stream_message = async (payload: LiveStreamChatPayload) => {
  const response = await api.post(ApiStrings.SEND_CHAT, payload);
  return response.data;
};

export const ban_user = async (payload: BanLivePayload) => {
  const response = await api.post(ApiStrings.BAN_USER(payload.stream_id), payload);
  return response.data;
};

export const report_user = async (payload: FormData) => {
  const response = await api.post(ApiStrings.REPORT, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
};

export const upload_shorts = async (payload: FormData) => {
  const response = await api.post(ApiStrings.UPLOAD_SHORT, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
};

export const get_stream_messages = async ({
  page = 1,
  limit = 50,
  streamId = 0,
}): Promise<LiveStreamChatsResponse> => {
  const response = await api.get<LiveStreamChatsResponse>(
    ApiStrings.GET_CHATS,
    {
      params: { page, limit, streamId },
    }
  );
  return response.data;
};

export const get_shorts = async ({
  page = 1,
  limit = 50,
}): Promise<ShortsResponse> => {
  const response = await api.get<ShortsResponse>(
    ApiStrings.GET_SHORTS,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

export const delete_story = async (id:number) =>{
  const response = await api.delete(`${ApiStrings.DELETE_STREAM}/${id}`);
  return response.data;
}
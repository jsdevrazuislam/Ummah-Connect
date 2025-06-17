import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const initialize_call = async (payload: CallInitialPayload) => {
  const response = await api.post(ApiStrings.INITIAL_CALL, payload);
  return response.data;
};

export const start_live = async (payload:StreamPayload): Promise<StartLiveStreamResponse> => {
  const response = await api.post<StartLiveStreamResponse>(ApiStrings.START_LIVE, payload);
  return response.data;
};

export const end_live = async (streamId:number) => {
  const response = await api.post(ApiStrings.END_LIVE, { streamId});
  return response.data;
};

export const get_streams = async (): Promise<LiveStreamResponse> => {
  const response = await api.get<LiveStreamResponse>(ApiStrings.GET_LIVES);
  return response.data;
};
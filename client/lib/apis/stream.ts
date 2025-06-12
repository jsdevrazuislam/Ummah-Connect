import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const initialize_call = async (payload: CallInitialPayload) => {
  const response = await api.post(ApiStrings.INITIAL_CALL, payload);
  return response.data;
};
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const loginUser = async (payload:LoginPayload): Promise<UserResponse> => {
  const response = await api.post<UserResponse>(ApiStrings.LOGIN, payload);
  return response.data;
};

export const fetchUserProfile = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(ApiStrings.ME);
  return response.data;
};

export const registerUser = async (payload:RegisterPayload) => {
  const response = await api.post(ApiStrings.REGISTER, payload);
  return response.data;
}
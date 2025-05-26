import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const loginUser = async (payload: LoginPayload): Promise<UserResponse> => {
  const response = await api.post<UserResponse>(ApiStrings.LOGIN, payload);
  return response.data;
};

export const fetchUserProfile = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(ApiStrings.ME);
  return response.data;
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post(ApiStrings.REGISTER, payload);
  return response.data;
}

export const updateCurrentUser = async (payload: FormData): Promise<UpdateUserResponse> => {
  const response = await api.put<Promise<UpdateUserResponse>>(ApiStrings.ME, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
};

export const getUserProfileDetails = async ({ page = 1, limit = 10, username = '' }): Promise<PostsResponse> => {
  const response = await api.get<PostsResponse>(ApiStrings.USER_DETAILS(username));
  return response.data;
}
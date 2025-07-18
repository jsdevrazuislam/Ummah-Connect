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
  const response = await api.get<PostsResponse>(ApiStrings.USER_DETAILS(username), { params: { page, limit}});
  return response.data;
}

export const updatePrivacySetting = async (payload:object) => {
  const response = await api.post(ApiStrings.PRIVACY_SETTING, payload);
  return response.data;
}

export const changePassword = async (payload:ChangePasswordPayload) => {
  const response = await api.post(ApiStrings.CHANGE_PASSWORD, payload);
  return response.data;
}
export const notificationPreferences = async (payload:object) => {
  const response = await api.post(ApiStrings.NOTIFICATION_PREFERENCE, payload);
  return response.data;
}
export const enable2FA = async () => {
  const response = await api.post(ApiStrings.ENABLE_2FA);
  return response.data;
}
export const disable2FA = async () => {
  const response = await api.post(ApiStrings.DISABLE_2FA);
  return response.data;
}
export const verify2FA = async (token:string) => {
  const response = await api.post(ApiStrings.VERIFY_2FA, { token });
  return response.data;
}
export const recoverLogin = async (payload:RecoverLoginPayload) => {
  const response = await api.post(ApiStrings.RECOVER_LOGIN, payload);
  return response.data;
}
export const recoverLoginWithEmail = async (payload:EmailVerifyPayload) => {
  const response = await api.post(ApiStrings.EMAIL_VERIFY_2FA, payload);
  return response.data;
}
export const requestOtp = async (email:string) => {
  const response = await api.post(ApiStrings.REQUEST_OTP, { email });
  return response.data;
}
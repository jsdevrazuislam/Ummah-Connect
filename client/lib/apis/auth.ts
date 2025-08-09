import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export async function loginUser(payload: LoginPayload): Promise<UserResponse> {
  const response = await api.post<UserResponse>(ApiStrings.LOGIN, payload);
  return response.data;
}

export async function fetchUserProfile(): Promise<UserResponse> {
  const response = await api.get<UserResponse>(ApiStrings.ME);
  return response.data;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post(ApiStrings.REGISTER, payload);
  return response.data;
}

export async function updateCurrentUser(payload: FormData): Promise<UpdateUserResponse> {
  const response = await api.put<Promise<UpdateUserResponse>>(ApiStrings.ME, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

export async function getUserProfileDetails({ page = 1, limit = 10, username = "" }): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>(ApiStrings.USER_DETAILS(username), { params: { page, limit } });
  return response.data;
}

export async function updatePrivacySetting(payload: object) {
  const response = await api.post(ApiStrings.PRIVACY_SETTING, payload);
  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.post(ApiStrings.CHANGE_PASSWORD, payload);
  return response.data;
}
export async function notificationPreferences(payload: object) {
  const response = await api.post(ApiStrings.NOTIFICATION_PREFERENCE, payload);
  return response.data;
}
export async function enable2FA() {
  const response = await api.post(ApiStrings.ENABLE_2FA);
  return response.data;
}
export async function disable2FA() {
  const response = await api.post(ApiStrings.DISABLE_2FA);
  return response.data;
}
export async function verify2FA(token: string) {
  const response = await api.post(ApiStrings.VERIFY_2FA, { token });
  return response.data;
}
export async function recoverLogin(payload: RecoverLoginPayload) {
  const response = await api.post(ApiStrings.RECOVER_LOGIN, payload);
  return response.data;
}
export async function recoverLoginWithEmail(payload: EmailVerifyPayload) {
  const response = await api.post(ApiStrings.EMAIL_VERIFY_2FA, payload);
  return response.data;
}
export async function requestOtp(email: string) {
  const response = await api.post(ApiStrings.REQUEST_OTP, { email });
  return response.data;
}
export async function explorePeoples({ page = 1, limit = 10, search, location, title, interests }: DiscoverParams): Promise<DiscoverPeopleResponse> {
  const params: Record<string, any> = {
    page,
    limit,
  };

  if (search)
    params.search = search;
  if (location)
    params.location = location;
  if (title)
    params.title = title;
  if (interests && interests.length > 0)
    params.interests = interests;

  const response = await api.get<DiscoverPeopleResponse>(ApiStrings.DISCOVER_PEOPLE, { params });
  return response.data;
}

export async function deleteAccount(): Promise<DeleteUserResponse> {
  const response = await api.delete<DeleteUserResponse>(ApiStrings.DELETE_ACCOUNT);
  return response.data;
}
export async function cancelAccountDeletion(): Promise<UserResponse> {
  const response = await api.post<UserResponse>(ApiStrings.CANCEL_ACCOUNT_DELETE, {});
  return response.data;
}

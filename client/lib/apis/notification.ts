import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const getNotifications = async ({ page= 1, limit=10}): Promise<NotificationResponse> => {
  const response = await api.get<NotificationResponse>(ApiStrings.GET_ALL_NOTIFICATION, { params: { page, limit}});
  return response.data;
};
export const markAllRead = async () => {
  const response = await api.get(ApiStrings.MARK_READ_NOTIFICATION);
  return response.data;
};

export const deleteNotification = async (id:number) =>{
  const response = await api.delete(`${ApiStrings.GET_ALL_NOTIFICATION}/${id}`);
  return response.data;
}
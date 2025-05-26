import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const followUnFollow = async (id:number) => {
  const response = await api.post(ApiStrings.FOLLOW_UNFOLLOW(id));
  return response.data;
};

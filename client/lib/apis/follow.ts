import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export async function followUnFollow(id: number) {
  const response = await api.post(ApiStrings.FOLLOW_UNFOLLOW(id));
  return response.data;
}

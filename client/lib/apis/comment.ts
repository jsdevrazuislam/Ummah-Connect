import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";


export const create_comment = async (payload: CommentPayload) => {
    const response = await api.post(ApiStrings.CREATE_COMMENT(payload.postId), { content: payload.content });
    return response.data;
}
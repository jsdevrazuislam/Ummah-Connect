import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";


export const create_comment = async (payload: CommentPayload) => {
    const response = await api.post(ApiStrings.CREATE_COMMENT(payload.postId), { content: payload.content });
    return response.data;
}

export const reply_comment = async (payload: ReplyCommentPayload) => {
    const response = await api.post(ApiStrings.REPLY_COMMENT(payload.id), { content: payload.content, postId: payload.postId });
    return response.data;
}

export const edit_comment = async (payload: EditCommentPayload) => {
    const response = await api.post(ApiStrings.EDIT_COMMENT(payload.commentId), { content: payload.content, postId: payload.postId, isReply: payload.isReply });
    return response.data;
}

export const delete_comment = async (id: number) => {
    const response = await api.delete(ApiStrings.DELETE_COMMENT(id));
    return response.data;
}

export const comment_react = async (payload: ReactPayload) => {
    const response = await api.post(ApiStrings.COMMENT_REACT(payload.id), payload);
    return response.data;
}

export const get_comments = async ({ page = 2, limit = 10, id }: { page: number, limit:number, id:number}): Promise<CommentsResponse> => {
    const response = await api.get<CommentsResponse>(ApiStrings.GET_COMMENTS(id), { params: { page, limit}});
    return response.data;
}
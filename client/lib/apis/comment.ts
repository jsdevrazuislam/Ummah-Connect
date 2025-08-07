import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export async function createComment(payload: CommentPayload) {
  const response = await api.post(ApiStrings.CREATE_COMMENT(payload.postId), { content: payload.content, type: payload.type });
  return response.data;
}

export async function replyComment(payload: ReplyCommentPayload) {
  const response = await api.post(ApiStrings.REPLY_COMMENT(payload.id), { content: payload.content, postId: payload.postId, type: payload.type });
  return response.data;
}

export async function editComment(payload: EditCommentPayload) {
  const response = await api.post(ApiStrings.EDIT_COMMENT(payload.commentId), { content: payload.content, postId: payload.postId, isReply: payload.isReply, type: payload.type });
  return response.data;
}

export async function deleteComment(payload: DeletePostCommentPayload) {
  const response = await api.delete(ApiStrings.DELETE_COMMENT(payload.commentId));
  return response.data;
}

export async function commentReact(payload: ReactPayload) {
  const response = await api.post(ApiStrings.COMMENT_REACT(payload.id), payload);
  return response.data;
}

export async function getComments({ page = 2, limit = 10, id, type }: { page: number; limit: number; id: number; type: string }): Promise<CommentsResponse> {
  const response = await api.get<CommentsResponse>(ApiStrings.GET_COMMENTS(id), { params: { page, limit, type } });
  return response.data;
}

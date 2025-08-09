import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export async function getAllPosts({
  page = 1,
  limit = 10,
}): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>(ApiStrings.ALL_POSTS, {
    params: { page, limit },
  });
  return response.data;
}

export async function getAllBookmarkPosts({
  page = 1,
  limit = 10,
}): Promise<BookmarkPostsResponse> {
  const response = await api.get<BookmarkPostsResponse>(ApiStrings.BOOKMARK_POSTS, {
    params: { page, limit },
  });
  return response.data;
}

export async function getAllFollowingPosts({
  page = 1,
  limit = 10,
}): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>(ApiStrings.FOLLOWING_ALL_POSTS, {
    params: { page, limit },
  });
  return response.data;
}

export async function createPost(payload: FormData) {
  const response = await api.post(ApiStrings.ALL_POSTS, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

export async function editPost(postId: number, payload: FormData) {
  const response = await api.put(ApiStrings.EDITPOST(postId), payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

export async function deletePost(id: number) {
  const response = await api.delete(ApiStrings.DELETEPOST(id));
  return response.data;
}

export async function deletePostMedia(id: number) {
  const response = await api.delete(ApiStrings.DELETE_MEDIA(id));
  return response.data;
}

export async function reactPost(payload: ReactPayload) {
  const response = await api.post(ApiStrings.REACTPOST(payload.id), { reactType: payload.reactType, icon: payload.icon });
  return response.data;
}

export async function sharePost(payload: SharePayload) {
  const response = await api.post<SharePostResponse>(ApiStrings.SHAREPOST(payload.postId), payload);
  return response.data;
}

export async function bookmarkPost(id: number) {
  const response = await api.post(ApiStrings.BOOKMARK_POST(id));
  return response.data;
}

export async function userSuggestion(query: string): Promise<SuggestionUsers> {
  const response = await api.get<SuggestionUsers>(`${ApiStrings.USER_SUGGESTION}?q=${query}`);
  return response.data;
}

export async function getStories(): Promise<StoryResponse> {
  const response = await api.get<StoryResponse>(ApiStrings.GET_STORIES);
  return response.data;
}
export async function getMyPosts(): Promise<MyPostResponse> {
  const response = await api.get<MyPostResponse>(ApiStrings.MY_POST);
  return response.data;
}

export async function createStory(payload: FormData): Promise<CreateStoryResponse> {
  const response = await api.post<CreateStoryResponse>(ApiStrings.CREATE_STORY, payload, {
    headers: {
      ...(payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {}),
    },
  });
  return response.data;
}

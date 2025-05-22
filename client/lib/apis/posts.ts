import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const get_all_posts = async ({
    page = 1,
    limit = 10,
}): Promise<PostsResponse> => {
    const response = await api.get<PostsResponse>(ApiStrings.ALL_POSTS, {
        params: { page, limit },
    });
    return response.data;
};

export const create_post = async (payload: FormData) => {
    const response = await api.post(ApiStrings.ALL_POSTS, payload, {
        headers: {
            ...(payload instanceof FormData
                ? { "Content-Type": "multipart/form-data" }
                : {}),
        },
    });
    return response.data;
};

export const edit_post = async (postId: number, payload: FormData) => {
    const response = await api.put(ApiStrings.EDITPOST(postId), payload, {
        headers: {
            ...(payload instanceof FormData
                ? { "Content-Type": "multipart/form-data" }
                : {}),
        },
    });
    return response.data;
};

export const delete_post = async (id: number) => {
    const response = await api.delete(ApiStrings.DELETEPOST(id));
    return response.data;
}

export const delete_post_media = async (id: number) => {
    const response = await api.delete(ApiStrings.DELETE_MEDIA(id));
    return response.data;
}

export const react_post = async (payload: ReactPayload) => {
    const response = await api.post(ApiStrings.REACTPOST(payload.id), { react_type: payload.react_type, icon: payload.icon });
    return response.data;
}

export const share_post = async (payload: ReactPayload) => {
    const response = await api.get(ApiStrings.SHAREPOST(payload.id));
    return response.data;
}

export const bookmark_post = async (id:number) => {
    const response = await api.post(ApiStrings.BOOKMARK_POST(id));
    return response.data;
}


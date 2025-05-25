const ApiStrings = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  // Posts
  ALL_POSTS: '/post/',
  EDITPOST: (id:number) => `/post/edit/${id}`,
  DELETEPOST: (id:number) => `/post/delete/${id}`,
  DELETE_MEDIA: (id:number) => `/post/delete/media/${id}`,
  REACTPOST: (id:number) => `/post/react/${id}`,
  SHAREPOST: (id:number) => `/post/share/${id}`,
  BOOKMARK_POST: (id:number) => `/post/bookmark/${id}`,
  // comments
  CREATE_COMMENT:(id:number) =>  `/comment/${id}`,
  EDIT_COMMENT:(id:number) =>  `/comment/edit/${id}`,
  REPLY_COMMENT:(id:number) =>  `/comment/reply/${id}`,
  DELETE_COMMENT:(id:number) =>  `/comment/delete/${id}`,
  COMMENT_REACT:(id:number) =>  `/comment/react/${id}`,
  GET_COMMENTS:(id:number) =>  `/comment/${id}/comments`,
};

export default ApiStrings;
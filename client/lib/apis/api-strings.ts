const ApiStrings = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  // Posts
  ALL_POSTS: '/post/',
  EDITPOST: (id:number) => `/post/edit/${id}`,
  DELETEPOST: (id:number) => `/post/delete/${id}`,
  REACTPOST: (id:number) => `/post/react/${id}`,
  SHAREPOST: (id:number) => `/post/share/${id}`,
  // comments
  CREATE_COMMENT:(id:number) =>  `/comment/${id}`
};

export default ApiStrings;
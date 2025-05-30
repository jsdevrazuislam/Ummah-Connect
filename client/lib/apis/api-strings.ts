const ApiStrings = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  USER_DETAILS: (username:string) => `/auth/${username}/details`,
  LOGOUT: "/auth/logout",
  PRIVACY_SETTING: "/auth/privacy-settings",
  NOTIFICATION_PREFERENCE: "/auth/notification-preference",
  CHANGE_PASSWORD: "/auth/change-password",
  ENABLE_2FA: "/auth/2fa/enable",
  VERIFY_2FA: "/auth/2fa/verify",
  DISABLE_2FA: "/auth/2fa/disable",
  RECOVER_LOGIN: "/auth/recover-login",
  REQUEST_OTP: "/auth/request-otp",
  EMAIL_VERIFY_2FA: "/auth/2fa/email-verify",
  // Posts
  ALL_POSTS: '/post/',
  FOLLOWING_ALL_POSTS: '/post/following/posts',
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
  // Follow
  FOLLOW_UNFOLLOW:(id:number) =>  `/follow/${id}`,
};

export default ApiStrings;
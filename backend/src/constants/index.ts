const DB_NAME = "chaiaurcode";
const DATA_LIMIT = "5MB";
const API_VERSION = '/api/v1'

const SocketEventEnum = Object.freeze({
  SOCKET_CONNECTED: "connected",
  SOCKET_DISCONNECTED: "disconnect",
  SOCKET_ERROR: "socketError",
  JOIN_POST: "joinPost",
  POST_REACT:"post_react",
  COMMENT_REACT:"commentReact",
  CREATE_COMMENT:"createComment",
  REPLY_COMMENT:"replyComment",
  EDITED_COMMENT:"edited_comment",
  DELETE_COMMENT:"deleteComment",
});

const USER_ATTRIBUTE = ['id', 'username', 'full_name', 'avatar', 'location', 'bio'];
const REACT_ATTRIBUTE = ['userId', 'react_type', 'icon', 'commentId', 'postId'];
const POST_ATTRIBUTE = ['id', 'media', 'content', 'location', 'privacy', 'createdAt']

export { DATA_LIMIT, DB_NAME, POST_ATTRIBUTE, SocketEventEnum, API_VERSION, USER_ATTRIBUTE, REACT_ATTRIBUTE };

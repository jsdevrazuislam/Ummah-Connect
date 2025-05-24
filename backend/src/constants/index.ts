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

export { DATA_LIMIT, DB_NAME, SocketEventEnum, API_VERSION };

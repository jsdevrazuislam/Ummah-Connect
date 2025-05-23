const SocketEventEnum = Object.freeze({
  SOCKET_CONNECTED: "connected",
  SOCKET_DISCONNECTED: "disconnect",
  SOCKET_ERROR: "socketError",
  POST_REACT:"post_react",
  JOIN_POST: "joinPost",
  COMMENT_REACT:"commentReact",
  CREATE_COMMENT:"createComment",
  EDITED_COMMENT:"edited_comment",
  REPLY_COMMENT:"replyComment",
});

export default SocketEventEnum
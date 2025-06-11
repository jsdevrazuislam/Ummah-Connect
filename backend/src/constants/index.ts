const DB_NAME = "chaiaurcode";
const DATA_LIMIT = "5MB";
const API_VERSION = '/api/v1'

const SocketEventEnum = Object.freeze({
  SOCKET_CONNECTED: "connected",
  SOCKET_DISCONNECTED: "disconnect",
  SOCKET_ERROR: "socketError",
  JOIN_POST: "joinPost",
  JOIN_CONVERSATION: "joinConversation",
  POST_REACT:"post_react",
  COMMENT_REACT:"commentReact",
  CREATE_COMMENT:"createComment",
  REPLY_COMMENT:"replyComment",
  EDITED_COMMENT:"edited_comment",
  DELETE_COMMENT:"deleteComment",
  SEND_MESSAGE_TO_CONVERSATION:"sendMessageToConversation",
  SEND_CONVERSATION_REQUEST:"addConversation",
  MESSAGE_RECEIVED:"messageReceived",
  TYPING:"typing:start",
  DISPLAY_TYPING:"displayTyping",
  ONLINE:"user:online",
  OFFLINE:"user:offline",
  OUTGOING_CALL:"outgoing:call",
  INCOMING_CALL:"incoming:call",
  CALL_ACCEPTED:"call:accepted",
  CALL_REJECTED:"call:rejected",
});

const USER_ATTRIBUTE = ['id', 'username', 'full_name', 'avatar', 'location', 'bio', 'privacy_settings'];
const REACT_ATTRIBUTE = ['userId', 'react_type', 'icon', 'commentId', 'postId'];
const POST_ATTRIBUTE = ['id', 'media', 'content', 'location', 'privacy', 'createdAt']
const MESSAGE_USER = ['id', 'full_name', 'avatar', 'username', 'last_seen_at']

export { DATA_LIMIT, DB_NAME, POST_ATTRIBUTE, SocketEventEnum, API_VERSION, USER_ATTRIBUTE, REACT_ATTRIBUTE, MESSAGE_USER };

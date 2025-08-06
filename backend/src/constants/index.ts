const DB_NAME = "chaiaurcode";
const DATA_LIMIT = "5MB";
const API_VERSION = "/api/v1";
const GRACE_PERIOD_MS = 60_000;

const SocketEventEnum = Object.freeze({
  SOCKET_CONNECTED: "connected",
  SOCKET_DISCONNECTED: "disconnect",
  SOCKET_ERROR: "socketError",
  JOIN_POST: "joinPost",
  JOIN_CONVERSATION: "joinConversation",
  JOIN_LIVE_STREAM: "joinLiveStream",
  JOIN_LIVE_SHORT: "joinShort",
  HOST_LEFT_LIVE_STREAM: "hostLeftLiveStream",
  HOST_JOIN_LIVE_STREAM: "hostJointLiveStream",
  HOST_END_LIVE_STREAM: "hostEndLiveStream",
  LIVE_CHAT_SEND: "liveChatSend",
  POST_REACT: "post_react",
  COMMENT_REACT: "commentReact",
  CREATE_COMMENT: "createComment",
  REPLY_COMMENT: "replyComment",
  EDITED_COMMENT: "edited_comment",
  DELETE_COMMENT: "deleteComment",
  SEND_MESSAGE_TO_CONVERSATION: "sendMessageToConversation",
  SEND_CONVERSATION_REQUEST: "addConversation",
  MESSAGE_RECEIVED: "messageReceived",
  TYPING: "typing:start",
  DISPLAY_TYPING: "displayTyping",
  ONLINE: "user:online",
  OFFLINE: "user:offline",
  OUTGOING_CALL: "outgoing:call",
  INCOMING_CALL: "incoming:call",
  CALL_ACCEPTED: "call:accepted",
  CALL_REJECTED: "call:rejected",
  CALL_TIMEOUT: "call_timeout",
  CALLER_LEFT: "caller_left",
  LIVE_VIEW_COUNT: "liveViewCount",
  USER_KICK_FROM_LIVE: "user_kick_from_live",
  BAN_VIEWER_FROM_MY_LIVE_STREAM: "ban_user_from_my_live_stream",
  NOTIFY_USER: "notify_user",
  FOLLOW_USER: "follow_user",
  UNFOLLOW_USER: "unfollow_user",
  DELETE_CONVERSATION: "delete_conversation",
  REACT_CONVERSATION_MESSAGE: "react_conversation_message",
  REMOVE_REACT_CONVERSATION_MESSAGE: "remove_react_conversation_message",
  EDITED_CONVERSATION: "edit_conversation_message",
  DELETE_CONVERSATION_MESSAGE: "delete_conversation_message",
  UNDO_DELETE_CONVERSATION_MESSAGE: "undo_conversation_message",
  READ_MESSAGE: "read_message",
  SHORT_REACT: "shortReact",

});

const USER_ATTRIBUTE = ["id", "username", "fullName", "avatar", "location", "bio", "privacySettings"];
const REACT_ATTRIBUTE = ["userId", "reactType", "icon", "commentId", "postId"];
const POST_ATTRIBUTE = ["id", "media", "content", "location", "privacy", "createdAt", "contentType", "background"];
const MESSAGE_USER = ["id", "fullName", "avatar", "username", "lastSeenAt", "publicKey"];
const MESSAGE_ATTRIBUTE = ["content", "keyForRecipient", "keyForSender"];

export { API_VERSION, DATA_LIMIT, DB_NAME, GRACE_PERIOD_MS, MESSAGE_ATTRIBUTE, MESSAGE_USER, POST_ATTRIBUTE, REACT_ATTRIBUTE, SocketEventEnum, USER_ATTRIBUTE };

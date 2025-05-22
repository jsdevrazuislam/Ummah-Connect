const DB_NAME = "chaiaurcode";
const DATA_LIMIT = "5MB";
const API_VERSION = '/api/v1'

const SocketEventEnum = Object.freeze({
  SOCKET_CONNECTED: "connected",
  SOCKET_DISCONNECTED: "disconnect",
  SOCKET_ERROR: "socketError",
  
});

export { DATA_LIMIT, DB_NAME, SocketEventEnum, API_VERSION };

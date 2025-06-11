import { Socket, Server } from "socket.io";
import { Request } from "express";
import { MessageStatus, User } from "@/models";
import { decode_token } from "@/utils/auth-helper";
import { JwtResponse } from "@/types/auth";
import { SocketEventEnum } from "@/constants";
import { Op } from "sequelize";
import redis from "@/config/redis";
import { getConversationUserIds } from "@/utils/query";

declare module "socket.io" {
  interface Socket {
    user?: User;
  }
}

interface SocketAuth {
  token?: string;
}

interface InitializeSocketIOOptions {
  io: Server;
}

interface EmitSocketEventParams<T> {
  req: Request;
  roomId: string;
  event: string;
  payload: T;
}

const joinRoom = (socket: Socket, eventEnum: string, roomPrefix: string) => {
  socket.on(eventEnum, (id) => {
    console.log(`User joined the ${roomPrefix} room. ${roomPrefix}Id: ${id}`);
    socket.join(`${roomPrefix}_${id}`);
  });
};

const setupSocketListeners = (socket: Socket) => {
  joinRoom(socket, SocketEventEnum.JOIN_POST, "post");
  joinRoom(socket, SocketEventEnum.JOIN_CONVERSATION, "conversation");
};

const initializeSocketIO = ({ io }: InitializeSocketIOOptions): void => {
  io.on("connection", async (socket: Socket) => {
    try {
      const auth = socket.handshake.auth as SocketAuth;

      let token: string | undefined = auth.token;

      let user: User | null = null;

      if (token && process.env.ACCESS_TOKEN_SECRET) {
        try {
          const decodedToken = decode_token(
            token,
            process.env.ACCESS_TOKEN_SECRET
          ) as JwtResponse;

          user = await User.findOne({ where: { id: decodedToken.id } });

          if (!user) {
            throw new Error("Token is invalid: User not found");
          }

          socket.user = user;
          const userId = user.id;
          setupSocketListeners(socket);
          socket.join(user.id.toString());
          await redis.set(`online_users:${user.id}`, Date.now(), 'EX', 60);
          const peerIds = await getConversationUserIds(userId);
          // Notify all peers that I am online
          for (const peerId of peerIds) {
            io.to(`user:${peerId}`).emit(SocketEventEnum.ONLINE, { userId });
          }

          // Notify me about online peers
          for (const peerId of peerIds) {
            const isPeerOnline = await redis.get(`online_users:${peerId}`);
            if (isPeerOnline) {
              socket.emit(SocketEventEnum.ONLINE, { userId: peerId });
            }
          }

          socket.join(`user:${userId}`);
          console.log(
            `Authenticated user connected userId: ${user.id.toString()}`
          );
        } catch (error) {
          console.error("Invalid token provided:", error);
        }
      }

      const connectionEvent = user
        ? SocketEventEnum.SOCKET_CONNECTED
        : SocketEventEnum.SOCKET_ERROR;

      const connectionMessage = user
        ? "Authenticated Socket Connected"
        : "Unauthenticated Socket Connected";

      socket.emit(connectionEvent, connectionMessage);

      if (!user) {
        console.log("Unauthenticated user connected");
      }

      socket.on(SocketEventEnum.MESSAGE_RECEIVED, async (messageId) => {
        await MessageStatus.update(
          { status: "delivered" },
          {
            where: {
              message_id: messageId,
              user_id: socket?.user?.id,
              status: { [Op.ne]: "seen" },
            },
          }
        );
      });

      socket.on(SocketEventEnum.TYPING, ({ conversationId, userId }) => {
        socket
          .to(`conversation_${conversationId}`)
          .emit(SocketEventEnum.TYPING, { userId });
      });

      socket.on(SocketEventEnum.OUTGOING_CALL, (payload) =>{
        socket
        .to(`user:${payload.to}`).emit(SocketEventEnum.INCOMING_CALL, {
          from: payload.from,
          callType: payload.callType,
          roomName: payload.roomName,
          callerName: payload.callerName,
          callerAvatar: payload.callerAvatar
        });
      })

      socket.on(SocketEventEnum.SOCKET_DISCONNECTED, async () => {
        console.log(
          `User has disconnected userId: ${socket.user?.id || "unknown"}`
        );
        const userId = socket.user?.id;
        if (userId) {
           await User.update(
            { last_seen_at: new Date()},
            { where: { id: socket?.user?.id}}
          )
          await redis.set(`last_seen:${userId}`, Date.now());
          const peerIds = await getConversationUserIds(userId);
          for (const peerId of peerIds) {
            io.to(`user:${peerId}`).emit(SocketEventEnum.OFFLINE, {
              userId,
              lastSeen: Date.now(),
            });
          }
          socket.leave(userId.toString());
        }
      });
    } catch (error) {
      console.error("Socket connection error:", error);
      socket.emit(
        SocketEventEnum.SOCKET_ERROR,
        error instanceof Error
          ? error.message
          : "Something went wrong while connecting to the socket"
      );
    }
  });
};

const emitSocketEvent = <T>({
  req,
  roomId,
  event,
  payload,
}: EmitSocketEventParams<T>): void => {
  try {
    const io: Server = req.app.get("io");
    io.to(roomId).emit(event, payload);
    console.log(`Event sent roomId ${roomId} and event name is ${event}`);
  } catch (error) {
    console.error("Failed to emit socket event:", error);
  }
};

export { initializeSocketIO, emitSocketEvent, SocketEventEnum };

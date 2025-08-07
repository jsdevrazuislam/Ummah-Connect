import type { Request } from "express";
import type { Server, Socket } from "socket.io";

import type { JwtResponse } from "@/types/auth";

import redis from "@/config/redis";
import { SocketEventEnum } from "@/constants";
import { User } from "@/models";
import { runSocketEvents } from "@/socket/socket-events";
import { decodeToken } from "@/utils/auth-helper";
import { getConversationUserIds } from "@/utils/query";

declare module "socket.io" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Socket {
    user?: User;
  }
}

type SocketAuth = {
  token?: string;
};

export type InitializeSocketIOOptions = {
  io: Server;
};

type EmitSocketEventParams<T> = {
  req: Request;
  roomId: string;
  event: string;
  payload: T;
};

function joinRoom(socket: Socket, eventEnum: string, roomPrefix: string) {
  socket.on(eventEnum, (id) => {
    console.log(`User joined the ${roomPrefix} room. ${roomPrefix}Id: ${id}`);
    socket.join(`${roomPrefix}_${id}`);
  });
}

function setupSocketListeners(socket: Socket) {
  joinRoom(socket, SocketEventEnum.JOIN_POST, "post");
  joinRoom(socket, SocketEventEnum.JOIN_CONVERSATION, "conversation");
  joinRoom(socket, SocketEventEnum.JOIN_LIVE_STREAM, "live_stream");
  joinRoom(socket, SocketEventEnum.JOIN_LIVE_SHORT, "short");
}

function initializeSocketIO({ io }: InitializeSocketIOOptions): void {
  io.on("connection", async (socket: Socket) => {
    try {
      const auth = socket.handshake.auth as SocketAuth;

      const token: string | undefined = auth.token;

      let user: User | null = null;

      if (token && process.env.ACCESS_TOKEN_SECRET) {
        try {
          const decodedToken = decodeToken(
            token,
            process.env.ACCESS_TOKEN_SECRET,
          ) as JwtResponse;

          user = await User.findOne({ where: { id: decodedToken.id } });

          if (!user) {
            throw new Error("Token is invalid: User not found");
          }

          socket.user = user;
          const userId = user.id;
          setupSocketListeners(socket);
          socket.join(user.id.toString());
          await redis.set(`online_users:${user.id}`, Date.now(), "EX", 60);
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
            `Authenticated user connected userId: ${user.id.toString()}`,
          );
        }
        catch (error) {
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

      runSocketEvents(socket, io);
    }
    catch (error) {
      console.error("Socket connection error:", error);
      socket.emit(
        SocketEventEnum.SOCKET_ERROR,
        error instanceof Error
          ? error.message
          : "Something went wrong while connecting to the socket",
      );
    }
  });
}

function emitSocketEvent<T>({
  req,
  roomId,
  event,
  payload,
}: EmitSocketEventParams<T>): void {
  try {
    const io: Server = req.app.get("io");
    io.to(roomId).emit(event, payload);
    console.log(`Event sent roomId ${roomId} and event name is ${event}`);
  }
  catch (error) {
    console.error("Failed to emit socket event:", error);
  }
}

export { emitSocketEvent, initializeSocketIO, SocketEventEnum };

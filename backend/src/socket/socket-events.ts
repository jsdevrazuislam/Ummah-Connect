import type { Server, Socket } from "socket.io";

import { Op } from "sequelize";

import redis from "@/config/redis";
import { GRACE_PERIOD_MS, SocketEventEnum } from "@/constants";
import { LiveStream, MessageStatus, StreamChatConversation, User } from "@/models";
import { getConversationUserIds } from "@/utils/query";

export function runSocketEvents(socket: Socket, io: Server) {
  socket.on(SocketEventEnum.MESSAGE_RECEIVED, async ({ id, conversationId, tempId }) => {
    const messageStatus = await MessageStatus.findOne(
      {
        where: {
          messageId: id,
          userId: socket?.user?.id,
          status: { [Op.ne]: "seen" },
        },
      },
    );

    if (!messageStatus)
      return;

    messageStatus.status = "delivered";
    await messageStatus.save();

    socket
      .to(`conversation_${conversationId?.toString()}`)
      .emit(SocketEventEnum.READ_MESSAGE, {
        conversationId,
        messageId: id,
        tempId,
        status: {
          status: "delivered",
          id: messageStatus.id,
        },
      });
  });

  socket.on(SocketEventEnum.TYPING, ({ conversationId, userId }) => {
    socket
      .to(`conversation_${conversationId}`)
      .emit(SocketEventEnum.TYPING, { userId });
  });

  socket.on(
    SocketEventEnum.CALL_REJECTED,
    async ({
      roomName,
      rejectedByUserId,
      callerUserId,
      callerName,
      callerAvatar,
      authToken,
    }) => {
      socket.to(`user:${callerUserId}`).emit(SocketEventEnum.CALL_REJECTED, {
        roomName,
        rejectedByName: rejectedByUserId,
        message: "The user is currently busy or declined your call.",
        callerName,
        callerAvatar,
      });

      await redis.del(`call:${roomName}`);
      await redis.del(`call-token:${roomName}:${authToken}`);
    },
  );

  socket.on(
    SocketEventEnum.CALLER_LEFT,
    async ({ roomName, userId, callerAvatar, callerName, authToken }) => {
      const callData = await redis.get(`call:${roomName}`);

      if (callData) {
        const call = JSON.parse(callData);
        const isAllowed = [
          Number(call.callerId),
          Number(call.receiverId),
        ].includes(Number(userId));

        if (isAllowed) {
          socket
            .to(`user:${call.receiverId}`)
            .emit(SocketEventEnum.CALLER_LEFT, {
              message: "Caller left from room",
              callerAvatar,
              callerName,
            });
          socket.to(`user:${call.callerId}`).emit(SocketEventEnum.CALLER_LEFT, {
            message: "User left from room",
            callerAvatar,
            callerName,
          });

          await redis.del(`call:${roomName}`);
          await redis.del(`call-token:${roomName}:${authToken}`);
        }
      }
    },
  );

  socket.on(
    SocketEventEnum.CALL_ACCEPTED,
    async ({ roomName, receiverId, callerUserId, callType, authToken }) => {
      socket.to(`user:${callerUserId}`).emit(SocketEventEnum.CALL_ACCEPTED, {
        roomName,
        receiverId,
        message: "Your call has been accepted.",
        callType,
        authToken,
      });

      await redis.set(
        `call:${roomName}`,
        JSON.stringify({
          callerId: callerUserId,
          receiverId,
          type: callType,
          status: "accept",
        }),
        "EX",
        60,
      );
    },
  );

  socket.on(
    SocketEventEnum.HOST_LEFT_LIVE_STREAM,
    async ({ streamId, username }) => {
      const key = `grace:stream:${streamId}`;

      await redis.set(key, "waiting", "EX", 65);

      setTimeout(async () => {
        const stillWaiting = await redis.get(key);

        if (stillWaiting === "waiting") {
          await redis.del(key);

          await LiveStream.update(
            { endedAt: new Date(), isActive: false },
            { where: { id: streamId } },
          );

          await StreamChatConversation.destroy({
            where: { streamId },
          });

          io.to(`live_stream_${streamId}`).emit(
            SocketEventEnum.HOST_END_LIVE_STREAM,
            { username },
          );
        }
      }, GRACE_PERIOD_MS);
    },
  );

  socket.on(SocketEventEnum.HOST_JOIN_LIVE_STREAM, async ({ streamId }) => {
    const key = `grace:stream:${streamId}`;
    const stillWaiting = await redis.get(key);

    if (stillWaiting === "waiting") {
      await redis.del(key);
    }
  });

  socket.on(SocketEventEnum.LIVE_VIEW_COUNT, ({ streamId, count }) => {
    io.emit(SocketEventEnum.LIVE_VIEW_COUNT, { streamId, count });
  });

  socket.on(SocketEventEnum.SOCKET_DISCONNECTED, async () => {
    console.log(
      `User has disconnected userId: ${socket.user?.id || "unknown"}`,
    );
    const userId = socket.user?.id;
    if (userId) {
      await User.update(
        { lastSeenAt: new Date() },
        { where: { id: socket?.user?.id } },
      );
      await redis.set(`last_seen:${userId}`, Date.now());
      const peerIds = await getConversationUserIds(userId);
      for (const peerId of peerIds) {
        socket.to(`user:${peerId}`).emit(SocketEventEnum.OFFLINE, {
          userId,
          lastSeen: Date.now(),
        });
      }
      socket.leave(userId.toString());
    }
  });

  socket.on(SocketEventEnum.FOLLOW_USER, ({ toUserId, fromUser }) => {
    io.to(`user:${toUserId}`).emit(SocketEventEnum.FOLLOW_USER, fromUser);
  });
  socket.on(SocketEventEnum.UNFOLLOW_USER, ({ toUserId, fromUser }) => {
    io.to(`user:${toUserId}`).emit(SocketEventEnum.UNFOLLOW_USER, fromUser);
  });
}

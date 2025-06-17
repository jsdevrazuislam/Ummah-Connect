import { Socket, Server } from "socket.io";
import { LiveStream, MessageStatus, User, StreamChatConversation } from "@/models";
import { SocketEventEnum, GRACE_PERIOD_MS } from "@/constants";
import { Op } from "sequelize";
import redis from "@/config/redis";
import { getConversationUserIds } from "@/utils/query";

export const runSocketEvents = (socket: Socket, io: Server) => {
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

  socket.on(
    SocketEventEnum.CALL_REJECTED,
    ({
      roomName,
      rejectedByUserId,
      callerUserId,
      callerName,
      callerAvatar,
    }) => {
      console.log(
        `Call to room ${roomName} rejected by ${rejectedByUserId}. Notifying ${callerUserId}`
      );
      socket.to(`user:${callerUserId}`).emit(SocketEventEnum.CALL_REJECTED, {
        roomName,
        rejectedByName: rejectedByUserId,
        message: "The user is currently busy or declined your call.",
        callerName: callerName,
        callerAvatar: callerAvatar,
      });
    }
  );

  socket.on(
    SocketEventEnum.CALLER_LEFT,
    async ({ roomName, userId, callerAvatar, callerName }) => {
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
        }
      }
    }
  );

  socket.on(
    SocketEventEnum.CALL_ACCEPTED,
    ({ roomName, receiverId, callerUserId }) => {
      console.log(
        `Call to room ${roomName} accepted by ${receiverId}. Notifying ${callerUserId}`
      );
      socket.to(`user:${callerUserId}`).emit(SocketEventEnum.CALL_ACCEPTED, {
        roomName,
        receiverId,
        message: "Your call has been accepted.",
      });
    }
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
            { ended_at: new Date(), is_active: false },
            { where: { id: streamId } }
          );

          await StreamChatConversation.destroy({
            where: { stream_id: streamId },
          });

          io.to(`live_stream_${streamId}`).emit(
            SocketEventEnum.HOST_END_LIVE_STREAM,
            { username }
          );
          console.log(`[Grace Timer Expired] Stream ${streamId} ended`);
        }
      }, GRACE_PERIOD_MS);
    }
  );

  socket.on(SocketEventEnum.HOST_JOIN_LIVE_STREAM, async ({ streamId }) => {
    const key = `grace:stream:${streamId}`;
    const stillWaiting = await redis.get(key);

    if (stillWaiting === "waiting") {
      await redis.del(key);
      console.log(`[Grace Cancelled] Host rejoined Stream ${streamId}`);
    }
  });

  socket.on(SocketEventEnum.LIVE_VIEW_COUNT, ({ streamId, count }) => {
    io.emit(SocketEventEnum.LIVE_VIEW_COUNT, { streamId, count });
  });

  socket.on(SocketEventEnum.SOCKET_DISCONNECTED, async () => {
    console.log(
      `User has disconnected userId: ${socket.user?.id || "unknown"}`
    );
    const userId = socket.user?.id;
    if (userId) {
      await User.update(
        { last_seen_at: new Date() },
        { where: { id: socket?.user?.id } }
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
};

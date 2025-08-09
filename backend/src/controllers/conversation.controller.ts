import type { Request, Response } from "express";

import { Op } from "sequelize";

import redis from "@/config/redis";
import { MESSAGE_ATTRIBUTE, MESSAGE_USER, SocketEventEnum } from "@/constants";
import { NOTIFICATION_CACHE } from "@/controllers/notification.controller";
import {
  Conversation,
  ConversationParticipant,
  Follow,
  Message,
  MessageReaction,
  MessageStatus,
  User,
} from "@/models";
import MessageAttachment from "@/models/message-attachment.models";
import { NotificationType } from "@/models/notification.models";
import { emitSocketEvent } from "@/socket";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import {
  getThumbnailFromVideo,
  uploadFileOnCloudinary,
} from "@/utils/cloudinary";
import { formatConversations } from "@/utils/format";
import { getFileType, getOrSetCache } from "@/utils/helper";
import { createAndInvalidateNotification } from "@/utils/notification";

async function DELETE_CONVERSATION_CACHE(isConversation: boolean) {
  if (!isConversation) {
    await redis.keys("conversation:messages:*").then((keys) => {
      if (keys.length > 0) {
        redis.del(...keys);
      }
    });
  }
  else {
    await redis.keys("conversations:*").then((keys) => {
      if (keys.length > 0) {
        redis.del(...keys);
      }
    });
  }
}

export const createConversationForDm = asyncHandler(
  async (req: Request, res: Response) => {
    const creatorId = Number(req.user.id);
    const { receiverId, type, content, keyForRecipient, keyForSender } = req.body;
    const receiverIdNum = Number(receiverId);

    if (creatorId === receiverIdNum)
      throw new ApiError(400, "You can't create conversation your self");

    const receiverUser = await User.findOne({ where: { id: receiverIdNum } });
    if (!receiverUser)
      throw new ApiError(404, "Conversation User not found");

    switch (receiverUser.privacySettings.message) {
      case "nobody":
        throw new ApiError(403, `This user does not accept direct messages.`);

      case "followers": {
        const isFollowing = await Follow.findOne({
          where: {
            followerId: creatorId,
            followingId: receiverIdNum,
          },
        });

        if (!isFollowing) {
          throw new ApiError(
            403,
            `This user only accepts direct messages from followers.`,
          );
        }
        break;
      }

      case "everyone":
        break;

      default:
        throw new ApiError(
          500,
          "An unexpected privacy setting was encountered.",
        );
    }

    const minId = Math.min(creatorId, receiverIdNum);
    const maxId = Math.max(creatorId, receiverIdNum);
    const canonicalKey = `${minId}_${maxId}`;

    const conversation = await Conversation.findOne({
      where: { userPairKey: canonicalKey },
    });
    if (conversation) {
      return res.json(
        new ApiResponse(200, conversation, "Already have an conversation"),
      );
    }

    const newConversation = await Conversation.create({
      userPairKey: canonicalKey,
      type,
      createdBy: creatorId,
    });

    await ConversationParticipant.bulkCreate([
      {
        conversationId: newConversation.id,
        userId: creatorId,
        unreadCount: 0,
      },
      {
        conversationId: newConversation.id,
        userId: receiverIdNum,
        unreadCount: 1,
      },
    ]);

    const newMessage = await Message.create({
      conversationId: newConversation.id,
      senderId: creatorId,
      content,
      sentAt: Date.now(),
      keyForRecipient,
      keyForSender,
    });

    await MessageStatus.create({
      messageId: newMessage.id,
      userId: receiverIdNum,
      status: "sent",
    });

    newConversation.lastMessageId = newMessage.id;

    await newConversation.save();

    const responseData = {
      id: newConversation.id,
      type: newConversation.type,
      name: receiverUser?.fullName,
      avatar: req.user.avatar,
      lastMessage: {
        id: newMessage.id,
        keyForRecipient: newMessage.keyForRecipient,
        keyForSender: newMessage.keyForSender,
        sender: {
          id: req.user.id,
          username: req.user.username,
          fullName: req.user.fullName,
          avatar: req.user.avatar,
        },
        content: newMessage.content,
        sentAt: newMessage.sentAt,
      },
      unreadCount: 0,
      lastSeenAt: receiverUser?.lastSeenAt,
      publicKey: receiverUser?.publicKey,
      isMuted: false,
    };

    emitSocketEvent({
      req,
      roomId: `${receiverId}`,
      event: SocketEventEnum.SEND_CONVERSATION_REQUEST,
      payload: { ...responseData, name: req.user.fullName, unreadCount: 1 },
    });

    if (receiverUser?.notificationPreferences?.dm) {
      const notification = await createAndInvalidateNotification({
        req,
        senderId: creatorId,
        receiverId: receiverIdNum,
        type: NotificationType.DM,
        message: "Open New Conversation",
      });

      emitSocketEvent({
        req,
        roomId: `user:${receiverIdNum}`,
        event: SocketEventEnum.NOTIFY_USER,
        payload: {
          ...notification.toJSON(),
          sender: {
            avatar: req.user?.avatar,
            fullName: req.user?.fullName,
          },
        },
      });

      await NOTIFICATION_CACHE(receiverIdNum);
    }

    await DELETE_CONVERSATION_CACHE(true);

    return res.json(new ApiResponse(200, responseData, "Conversation Created"));
  },
);

export const getAllConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number.parseInt(req.params?.page as string) || 1;
    const limit = Number.parseInt(req.params?.limit as string) || 10;
    const skip = (page - 1) * limit;
    const cacheKey = `conversations:page=${page}:limit=${limit}:user=${req.user.id}`;

    const responseData = await getOrSetCache(
      cacheKey,
      async () => {
        const { count, rows } = await ConversationParticipant.findAndCountAll({
          where: {
            userId: req.user.id,
            isArchived: null,
            leftAt: { [Op.is]: null },
          },
          include: [
            {
              model: Conversation,
              as: "conversation",
              attributes: ["id", "name", "type", "lastMessageId", "createdAt"],
              include: [
                {
                  model: Message,
                  as: "lastMessage",
                  attributes: ["id", "senderId", "content", "sentAt", "keyForSender", "keyForRecipient"],
                  include: [
                    {
                      model: User,
                      as: "sender",
                      attributes: MESSAGE_USER,
                    },
                  ],
                  required: false,
                },
                {
                  model: ConversationParticipant,
                  as: "participants",
                  attributes: ["userId", "unreadCount"],
                  where: { userId: { [Op.ne]: req.user.id } },
                  required: false,
                  include: [
                    {
                      model: User,
                      as: "user",
                      attributes: MESSAGE_USER,
                    },
                  ],
                },
              ],
            },
          ],
          order: [
            [
              { model: Conversation, as: "conversation" },
              { model: Message, as: "lastMessage" },
              "sentAt",
              "DESC",
            ],
          ],
          limit,
          offset: skip,
          distinct: true,
        });

        const responseData = formatConversations(rows);

        return {
          conversations: responseData,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          totalConversations: count,
        };
      },
      60,
    );

    return res.json(new ApiResponse(200, responseData, "Success"));
  },
);

export const getConversationMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const page = Number.parseInt(req.params.page) || 1;
    const limit = Number.parseInt(req.params.limit) || 30;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation)
      throw new ApiError(404, "Conversation not found");

    const participant = await ConversationParticipant.findOne({
      where: {
        userId: req.user.id,
        conversationId,
      },
    });

    if (!participant)
      throw new ApiError(403, "You are not participant of this conversation ");

    const cacheKey = `conversation:messages:page=${page}:limit=${limit}:user=${req.user.id}`;

    const responseData = await getOrSetCache(
      cacheKey,
      async () => {
        const { rows, count } = await Message.findAndCountAll({
          where: {
            conversationId,
          },
          include: [
            {
              model: User,
              as: "sender",
              attributes: MESSAGE_USER,
            },
            {
              model: MessageReaction,
              as: "reactions",
              include: [
                {
                  model: User,
                  as: "reactedUser",
                  attributes: MESSAGE_USER,
                },
              ],
              attributes: ["emoji", "emoji", "messageId", "id", "userId"],
            },
            {
              model: MessageStatus,
              as: "statuses",
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: MESSAGE_USER,
                },
              ],
              attributes: ["status", "id"],
            },
            {
              model: MessageAttachment,
              as: "attachments",
              required: false,
            },
            {
              model: Message,
              as: "parentMessage",
              include: [
                {
                  model: User,
                  as: "sender",
                  attributes: MESSAGE_USER,
                },
                {
                  model: MessageAttachment,
                  as: "attachments",
                  required: false,
                },
              ],
              attributes: MESSAGE_ATTRIBUTE,
            },
          ],
          order: [["sentAt", "ASC"]],
          limit,
          offset: skip,
        });

        return {
          messages: rows,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        };
      },
      60,
    );

    return res.json(new ApiResponse(200, responseData, "Success"));
  },
);

export const sendMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId, content, keyForRecipient, keyForSender } = req.body;
    const senderId = req.user.id;

    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });
    if (!conversation)
      throw new ApiError(404, "Conversation not found");

    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: req.user.id,
      },
    });

    if (!participant) {
      throw new ApiError(403, "You are not a participant in this conversation");
    }

    const allParticipants = await ConversationParticipant.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: "user",
          attributes: MESSAGE_USER,
        },
      ],
    });

    const receiverParticipants = allParticipants.filter(
      p => p.userId !== senderId,
    );

    if (receiverParticipants.length === 0 && conversation.type === "direct") {
      throw new ApiError(
        400,
        "Direct message conversation must have another participant.",
      );
    }

    const newMessage = await Message.create({
      conversationId,
      senderId,
      content,
      sentAt: new Date(),
      keyForRecipient,
      keyForSender,
    });

    const messageStatuses = receiverParticipants.map(participant => ({
      messageId: newMessage.id,
      userId: participant.userId,
      status: "sent",
    }));

    if (messageStatuses.length > 0) {
      await MessageStatus.bulkCreate(messageStatuses);
    }

    await Promise.all(
      receiverParticipants.map(async (participant) => {
        participant.unreadCount = (participant.unreadCount || 0) + 1;
        await participant.save();
      }),
    );

    conversation.lastMessageId = newMessage.id;
    await conversation.save();

    const fullMessage = await Message.findOne({
      where: { id: newMessage.id },
      include: [
        {
          model: MessageStatus,
          as: "statuses",
          attributes: ["status", "id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: MESSAGE_USER,
            },
          ],
        },
      ],
    });

    const responseData = {
      ...newMessage.toJSON(),
      sender: {
        fullName: req.user.fullName,
        avatar: req.user.avatar,
        id: req.user.id,
        username: req.user.username,
      },
      attachments: [],
      statuses: fullMessage?.statuses ?? [],
      tempId: req.body.id,
    };

    emitSocketEvent({
      req,
      roomId: `conversation_${conversationId}`,
      event: SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION,
      payload: responseData,
    });

    await DELETE_CONVERSATION_CACHE(false);
    return res.json(new ApiResponse(200, responseData, "success"));
  },
);

export const readMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { messageId, conversationId } = req.body;

    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });

    if (!conversation)
      throw new ApiError(404, "Conversation not found");

    const participant = await ConversationParticipant.findOne({
      where: {
        userId: req.user.id,
        conversationId,
      },
    });

    if (!participant)
      throw new ApiError(403, "You are not participant of this conversation");

    const [, status] = await MessageStatus.update(
      { status: "seen" },
      {
        where: {
          userId: req.user.id,
          status: { [Op.ne]: "seen" },
        },
        returning: true,
      },
    );

    participant.unreadCount = 0;
    participant.lastReadMessageId = messageId;

    await participant.save();
    await DELETE_CONVERSATION_CACHE(false);

    emitSocketEvent({
      req,
      roomId: `conversation_${conversationId}`,
      event: SocketEventEnum.READ_MESSAGE,
      payload: {
        conversationId,
        messageId,
        status: {
          status: "seen",
          id: status[0]?.id,
          user: {
            id: req.user.id,
            fullName: req.user.fullName,
            username: req.user.username,
            avatar: req.user.avatar,
            publicKey: req.user.publicKey,
            lastSeenAt: req.user.lastSeenAt,
          },
        },
      },
    });

    return res.json(new ApiResponse(200, null, "Success"));
  },
);

export const sendAttachment = asyncHandler(
  async (req: Request, res: Response) => {
    const senderId = req.user.id;
    const { conversationId, content, keyForRecipient, keyForSender } = req.body;
    const files = req.files as Express.Multer.File[];

    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });
    if (!conversation)
      throw new ApiError(404, "Conversation not found");

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId: senderId },
    });
    if (!participant)
      throw new ApiError(403, "You are not a participant in this conversation");

    const allParticipants = await ConversationParticipant.findAll({
      where: { conversationId },
    });
    const receiverParticipants = allParticipants.filter(
      p => p.userId !== senderId,
    );

    if (receiverParticipants.length === 0 && conversation.type === "direct") {
      throw new ApiError(400, "Direct message must have a receiver");
    }

    const newMessage = await Message.create({
      conversationId,
      senderId,
      content,
      sentAt: new Date(),
      keyForRecipient,
      keyForSender,
    });

    if (files && files.length > 0) {
      const uploadedAttachments = await Promise.all(
        files.map(async (file) => {
          const media = await uploadFileOnCloudinary(
            file.path,
            "ummah_connect/message_attachment",
            file.mimetype,
          );

          return {
            messageId: newMessage.id,
            fileUrl: media?.url,
            fileType: getFileType(file.mimetype),
            sizeInBytes: file.size,
            duration: media?.duration,
            thumbnailUrl: getThumbnailFromVideo(
              media?.url ?? "",
              file.mimetype,
            ),
          };
        }),
      );
      await MessageAttachment.bulkCreate(uploadedAttachments);
    }

    const messageStatuses = receiverParticipants.map(p => ({
      messageId: newMessage.id,
      userId: p.userId,
      status: "sent",
    }));

    if (messageStatuses.length > 0) {
      await MessageStatus.bulkCreate(messageStatuses);
    }

    await Promise.all(
      receiverParticipants.map(async (participant) => {
        participant.unreadCount = (participant.unreadCount || 0) + 1;
        await participant.save();
      }),
    );

    conversation.lastMessageId = newMessage.id;
    await conversation.save();

    const fullMessage = await Message.findOne({
      where: { id: newMessage.id },
      include: [{ model: MessageAttachment, as: "attachments" }],
    });

    const responseData = {
      ...fullMessage?.toJSON(),
      sender: {
        id: req.user.id,
        fullName: req.user.fullName,
        username: req.user.username,
        avatar: req.user.avatar,
      },
    };

    emitSocketEvent({
      req,
      roomId: `conversation_${conversationId}`,
      event: SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION,
      payload: responseData,
    });

    await DELETE_CONVERSATION_CACHE(false);

    return res.json(
      new ApiResponse(200, responseData, "Message with attachments sent"),
    );
  },
);

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = Number.parseInt(req.params.id);
  const userId = req.user.id;

  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = await ConversationParticipant.findOne({
    where: {
      conversationId,
      userId,
    },
  });

  if (!isParticipant) {
    throw new ApiError(403, "Not authorized to delete this conversation");
  }

  const participants = await ConversationParticipant.findAll({
    where: { conversationId },
  });

  await conversation.destroy();

  await DELETE_CONVERSATION_CACHE(true);

  participants.forEach((participant) => {
    emitSocketEvent({
      req,
      roomId: `user:${participant.userId}`,
      event: SocketEventEnum.DELETE_CONVERSATION,
      payload: {
        conversationId,
        message: "Conversation deleted successfully",
      },
    });
  });

  return res.json(new ApiResponse(200, null, "Conversation deleted successfully"));
});

export const reactToMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  if (!emoji)
    throw new ApiError(400, "Emoji is required");

  const message = await Message.findByPk(messageId);
  if (!message)
    throw new ApiError(404, "Message not found");

  const isParticipant = await ConversationParticipant.findOne({
    where: { conversationId: message.conversationId, userId },
  });
  if (!isParticipant)
    throw new ApiError(403, "You are not part of this conversation");

  const existingReaction = await MessageReaction.findOne({
    where: {
      messageId: message.id,
      userId,
    },
  });

  let reaction;
  let created = false;

  if (existingReaction) {
    existingReaction.emoji = emoji;
    await existingReaction.save();
    reaction = existingReaction;
  }
  else {
    reaction = await MessageReaction.create({
      messageId: message.id,
      userId,
      emoji,
    });
    created = true;
  }

  await DELETE_CONVERSATION_CACHE(false);

  const responseData = {
    ...reaction?.toJSON(),
    reactedUser: {
      id: req.user.id,
      fullName: req.user.fullName,
      avatar: req.user?.avatar,
      username: req?.user?.username,
    },
    conversationId: message.conversationId,
  };

  emitSocketEvent({
    req,
    roomId: `conversation_${message.conversationId}`,
    event: SocketEventEnum.REACT_CONVERSATION_MESSAGE,
    payload: responseData,
  });

  return res.json(
    new ApiResponse(200, responseData, created ? "Reaction added" : "Reaction updated"),
  );
});

export const removeReactionFromMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findByPk(messageId);
  if (!message)
    throw new ApiError(404, "Message not found");

  const deleted = await MessageReaction.destroy({
    where: { messageId, userId },
  });

  if (!deleted)
    throw new ApiError(404, "Reaction not found");

  await DELETE_CONVERSATION_CACHE(false);

  emitSocketEvent({
    req,
    roomId: `conversation_${message.conversationId}`,
    event: SocketEventEnum.REMOVE_REACT_CONVERSATION_MESSAGE,
    payload: { messageId: Number(messageId), userId, conversationId: message.conversationId },
  });

  return res.json(new ApiResponse(200, null, "Reaction removed"));
});

export const replyToMessage = asyncHandler(async (req: Request, res: Response) => {
  const { parentMessageId } = req.params;
  const { content, keyForSender, keyForRecipient, receiverId } = req.body;
  const userId = req.user.id;

  if (!content)
    throw new ApiError(400, "Content is required");

  const parentMessage = await Message.findOne({
    where: { id: parentMessageId },
    include: [
      {
        model: User,
        as: "sender",
        attributes: MESSAGE_USER,
      },
      {
        model: MessageAttachment,
        as: "attachments",
        required: false,
      },
    ],
  });
  if (!parentMessage)
    throw new ApiError(404, "Original message not found");

  const isParticipant = await ConversationParticipant.findOne({
    where: { conversationId: parentMessage.conversationId, userId },
  });
  if (!isParticipant)
    throw new ApiError(403, "You are not part of this conversation");

  const reply = await Message.create({
    conversationId: parentMessage.conversationId,
    senderId: userId,
    parentMessageId: parentMessage.id,
    content,
    keyForSender,
    keyForRecipient,
    sentAt: new Date(),
    isDeleted: false,
  });

  await MessageStatus.create({
    messageId: reply.id,
    userId: Number(receiverId),
    status: "sent",
  });

  await DELETE_CONVERSATION_CACHE(false);

  const responseData = {
    ...reply.toJSON(),
    sender: {
      fullName: req.user.fullName,
      avatar: req.user.avatar,
      id: req.user.id,
      username: req.user.username,
      publicKey: req.user.publicKey,
      lastSeenAt: req.user.lastSeenAt,
    },
    statuses: [
      {
        status: "sent",
      },
    ],
    attachments: [],
    parentMessage: {
      ...parentMessage.toJSON(),
    },
  };

  emitSocketEvent({
    req,
    roomId: `conversation_${parentMessage.conversationId}`,
    event: SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION,
    payload: responseData,
  });

  return res.json(new ApiResponse(201, responseData, "Reply sent successfully"));
});

export const editMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content, keyForRecipient, keyForSender } = req.body;
  const userId = req.user.id;

  if (!content)
    throw new ApiError(400, "Content is required");

  const message = await Message.findByPk(messageId);
  if (!message)
    throw new ApiError(404, "Message not found");

  if (message.senderId !== userId)
    throw new ApiError(403, "You can only edit your own messages");

  if (message.isDeleted)
    throw new ApiError(400, "Cannot edit a deleted message");

  message.content = content;
  message.keyForRecipient = keyForRecipient;
  message.keyForSender = keyForSender;
  message.isUpdated = true;
  await message.save();

  await DELETE_CONVERSATION_CACHE(false);

  const responseData = {
    ...message.toJSON(),
    sender: {
      fullName: req.user.fullName,
      avatar: req.user.avatar,
      id: req.user.id,
      username: req.user.username,
      publicKey: req.user.publicKey,
      lastSeenAt: req.user.lastSeenAt,
    },
    statuses: [
      {
        status: "sent",
      },
    ],
    attachments: [],
  };

  emitSocketEvent({
    req,
    roomId: `conversation_${message.conversationId}`,
    event: SocketEventEnum.EDITED_CONVERSATION,
    payload: responseData,
  });

  return res.json(new ApiResponse(200, responseData, "Message updated"));
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findByPk(messageId);
  if (!message)
    throw new ApiError(404, "Message not found");

  const isParticipant = await ConversationParticipant.findOne({
    where: {
      conversationId: message.conversationId,
      userId,
    },
  });

  if (!isParticipant)
    throw new ApiError(403, "You are not part of this conversation");

  if (message.senderId !== userId)
    throw new ApiError(403, "You can only delete your own messages");

  if (message.isDeleted)
    throw new ApiError(400, "Message already deleted");

  message.isDeleted = true;
  message.deletedById = userId;
  message.deletedAt = new Date();

  await message.save();

  await DELETE_CONVERSATION_CACHE(false);

  emitSocketEvent({
    req,
    roomId: `conversation_${message.conversationId}`,
    event: SocketEventEnum.DELETE_CONVERSATION_MESSAGE,
    payload: { ...message.toJSON() },
  });

  return res.json(new ApiResponse(200, {}, "Message deleted"));
});

export const undoDeleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findByPk(messageId);
  if (!message)
    throw new ApiError(404, "Message not found");

  if (message.senderId !== userId)
    throw new ApiError(403, "You can only restore your own messages");

  if (!message.isDeleted)
    throw new ApiError(400, "Message is not deleted");

  message.isDeleted = false;
  message.deletedAt = null;
  message.deletedById = null;

  await message.save();

  await DELETE_CONVERSATION_CACHE(false);

  emitSocketEvent({
    req,
    roomId: `conversation_${message.conversationId}`,
    event: SocketEventEnum.UNDO_DELETE_CONVERSATION_MESSAGE,
    payload: { ...message.toJSON() },
  });

  return res.json(new ApiResponse(200, {}, "Message restored"));
});

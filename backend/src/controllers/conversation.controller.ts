import redis from "@/config/redis";
import { MESSAGE_ATTRIBUTE, MESSAGE_USER, SocketEventEnum } from "@/constants";
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
import { emitSocketEvent } from "@/socket";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import {
    getThumbnailFromVideo,
    uploadFileOnCloudinary
} from "@/utils/cloudinary";
import { formatConversations } from "@/utils/format";
import { getFileType, getOrSetCache } from "@/utils/helper";
import { Request, Response } from "express";
import { Op } from "sequelize";


const DELETE_CONVERSATION_CACHE = async (isConversation: boolean) => {

    if (!isConversation) {
        await redis.keys("conversation:messages:*").then((keys) => {
            if (keys.length > 0) {
                redis.del(...keys);
            }
        });
    } else {
        await redis.keys("conversations:*").then((keys) => {
            if (keys.length > 0) {
                redis.del(...keys);
            }
        });
    }

}

export const create_conversation_for_dm = asyncHandler(
    async (req: Request, res: Response) => {
        const creatorId = Number(req.user.id);
        const { receiverId, type, content, key_for_recipient, key_for_sender } = req.body;
        const receiverIdNum = Number(receiverId);

        if (creatorId === receiverIdNum)
            throw new ApiError(400, "You can't create conversation your self");

        const receiverUser = await User.findOne({ where: { id: receiverIdNum } });
        if (!receiverUser) throw new ApiError(404, "Conversation User not found");

        switch (receiverUser.privacy_settings.message) {
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
                        `This user only accepts direct messages from followers.`
                    );
                }
                break;
            }

            case "everyone":
                break;

            default:
                throw new ApiError(
                    500,
                    "An unexpected privacy setting was encountered."
                );
        }

        const minId = Math.min(creatorId, receiverIdNum);
        const maxId = Math.max(creatorId, receiverIdNum);
        const canonicalKey = `${minId}_${maxId}`;

        const conversation = await Conversation.findOne({
            where: { user_pair_key: canonicalKey },
        });
        if (conversation)
            return res.json(
                new ApiResponse(200, conversation, "Already have an conversation")
            );

        const newConversation = await Conversation.create({
            user_pair_key: canonicalKey,
            type,
            created_by: creatorId,
        });

        await ConversationParticipant.bulkCreate([
            {
                conversation_id: newConversation.id,
                user_id: creatorId,
                unread_count: 0,
            },
            {
                conversation_id: newConversation.id,
                user_id: receiverIdNum,
                unread_count: 1,
            },
        ]);

        const newMessage = await Message.create({
            conversation_id: newConversation.id,
            sender_id: creatorId,
            content,
            sent_at: Date.now(),
            key_for_recipient,
            key_for_sender
        });

        await MessageStatus.create({
            message_id: newMessage.id,
            user_id: receiverIdNum,
            status: "sent",
        });

        newConversation.last_message_id = newMessage.id;

        await newConversation.save();

        const responseData = {
            id: newConversation.id,
            type: newConversation.type,
            name: receiverUser?.full_name,
            avatar: req.user.avatar,
            lastMessage: {
                id: newMessage.id,
                key_for_recipient: newMessage.key_for_recipient,
                key_for_sender: newMessage.key_for_sender,
                sender: {
                    id: req.user.id,
                    username: req.user.username,
                    full_name: req.user.full_name,
                    avatar: req.user.avatar,
                },
                content: newMessage.content,
                sent_at: newMessage.sent_at,
            },
            unreadCount: 0,
            last_seen_at: receiverUser?.last_seen_at,
            public_key: receiverUser?.public_key,
            isMuted: false,
        };

        emitSocketEvent({
            req,
            roomId: `${receiverId}`,
            event: SocketEventEnum.SEND_CONVERSATION_REQUEST,
            payload: { ...responseData, name: req.user.full_name, unreadCount: 1 },
        });

        await DELETE_CONVERSATION_CACHE(true)

        return res.json(new ApiResponse(200, responseData, "Conversation Created"));
    }
);

export const get_all_conversations = asyncHandler(
    async (req: Request, res: Response) => {
        const page = parseInt(req.params?.page as string) || 1;
        const limit = parseInt(req.params?.limit as string) || 10;
        const skip = (page - 1) * limit;
        const cacheKey = `conversations:page=${page}:limit=${limit}:user=${req.user.id}`;

        const responseData = await getOrSetCache(
            cacheKey,
            async () => {
                const { count, rows } = await ConversationParticipant.findAndCountAll({
                    where: {
                        user_id: req.user.id,
                        is_archived: null,
                        left_at: { [Op.is]: null },
                    },
                    include: [
                        {
                            model: Conversation,
                            as: "conversation",
                            attributes: ["id", "name", "type", "last_message_id", "createdAt"],
                            include: [
                                {
                                    model: Message,
                                    as: "lastMessage",
                                    attributes: ["id", "sender_id", "content", "sent_at", "key_for_sender", "key_for_recipient"],
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
                                    attributes: ["user_id", "unread_count"],
                                    where: { user_id: { [Op.ne]: req.user.id } },
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
                            "sent_at",
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
            60
        );

        return res.json(new ApiResponse(200, responseData, "Success"));
    }
);

export const get_conversation_message = asyncHandler(
    async (req: Request, res: Response) => {
        const conversationId = req.params.id;
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.limit) || 30;
        const skip = (page - 1) * limit;

        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) throw new ApiError(404, "Conversation not found");

        const participant = await ConversationParticipant.findOne({
            where: {
                user_id: req.user.id,
                conversation_id: conversationId,
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
                        conversation_id: conversationId,
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
                                }
                            ],
                            attributes: ['emoji', 'emoji', 'message_id', "id"]
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
                                }
                            ],
                            attributes: ["status"]
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
                            attributes: MESSAGE_ATTRIBUTE
                        },
                    ],
                    order: [["sent_at", "ASC"]],
                    limit,
                    offset: skip,
                });

                return {
                    messages: rows,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                };
            },
            60
        );

        return res.json(new ApiResponse(200, responseData, "Success"));
    }
);

export const send_message = asyncHandler(
    async (req: Request, res: Response) => {
        const { conversationId, content, key_for_recipient, key_for_sender } = req.body;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            where: { id: conversationId },
        });
        if (!conversation) throw new ApiError(404, "Conversation not found");

        const participant = await ConversationParticipant.findOne({
            where: {
                conversation_id: conversationId,
                user_id: req.user.id,
            },
        });

        if (!participant) {
            throw new ApiError(403, "You are not a participant in this conversation");
        }

        const allParticipants = await ConversationParticipant.findAll({
            where: { conversation_id: conversationId },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: MESSAGE_USER,
                },
            ],
        });

        const receiverParticipants = allParticipants.filter(
            (p) => p.user_id !== senderId
        );

        if (receiverParticipants.length === 0 && conversation.type === "direct") {
            throw new ApiError(
                400,
                "Direct message conversation must have another participant."
            );
        }

        const newMessage = await Message.create({
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            sent_at: new Date(),
            key_for_recipient,
            key_for_sender
        });

        const messageStatuses = receiverParticipants.map((participant) => ({
            message_id: newMessage.id,
            user_id: participant.user_id,
            status: "sent",
        }));

        if (messageStatuses.length > 0) {
            await MessageStatus.bulkCreate(messageStatuses);
        }

        await Promise.all(
            receiverParticipants.map(async (participant) => {
                participant.unread_count = (participant.unread_count || 0) + 1;
                await participant.save();
            })
        );

        conversation.last_message_id = newMessage.id;
        await conversation.save();

        const responseData = {
            ...newMessage.toJSON(),
            sender: {
                full_name: req.user.full_name,
                avatar: req.user.avatar,
                id: req.user.id,
                username: req.user.username,
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
            roomId: `conversation_${conversationId}`,
            event: SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION,
            payload: responseData,
        });

        await DELETE_CONVERSATION_CACHE(false)
        return res.json(new ApiResponse(200, responseData, "success"));
    }
);

export const read_message = asyncHandler(
    async (req: Request, res: Response) => {
        const { messageId, conversationId } = req.body;

        const conversation = await Conversation.findOne({
            where: { id: conversationId },
        });

        if (!conversation) throw new ApiError(404, "Conversation not found");

        const participant = await ConversationParticipant.findOne({
            where: {
                user_id: req.user.id,
                conversation_id: conversationId,
            },
        });

        if (!participant)
            throw new ApiError(403, "You are not participant of this conversation");

        await MessageStatus.update(
            { status: "seen" },
            {
                where: {
                    user_id: req.user.id,
                    status: { [Op.ne]: "seen" },
                },
            }
        );

        participant.unread_count = 0;
        participant.last_read_message_id = messageId;

        await participant.save();
        await DELETE_CONVERSATION_CACHE(false)

        return res.json(new ApiResponse(200, null, "Success"));
    }
);

export const send_attachment = asyncHandler(
    async (req: Request, res: Response) => {
        const senderId = req.user.id;
        const { conversationId, content } = req.body;
        const files = req.files as Express.Multer.File[];

        const conversation = await Conversation.findOne({
            where: { id: conversationId },
        });
        if (!conversation) throw new ApiError(404, "Conversation not found");

        const participant = await ConversationParticipant.findOne({
            where: { conversation_id: conversationId, user_id: senderId },
        });
        if (!participant)
            throw new ApiError(403, "You are not a participant in this conversation");

        const allParticipants = await ConversationParticipant.findAll({
            where: { conversation_id: conversationId },
        });
        const receiverParticipants = allParticipants.filter(
            (p) => p.user_id !== senderId
        );

        if (receiverParticipants.length === 0 && conversation.type === "direct") {
            throw new ApiError(400, "Direct message must have a receiver");
        }

        const newMessage = await Message.create({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content || "Attachment",
            sent_at: new Date(),
        });

        if (files && files.length > 0) {
            const uploadedAttachments = await Promise.all(
                files.map(async (file) => {
                    const media = await uploadFileOnCloudinary(
                        file.path,
                        "ummah_connect/message_attachment",
                        file.mimetype
                    );

                    return {
                        message_id: newMessage.id,
                        file_url: media?.url,
                        file_type: getFileType(file.mimetype),
                        size_in_bytes: file.size,
                        duration: media?.duration,
                        thumbnail_url: getThumbnailFromVideo(
                            media?.url ?? "",
                            file.mimetype
                        ),
                    };
                })
            );
            await MessageAttachment.bulkCreate(uploadedAttachments);
        }

        const messageStatuses = receiverParticipants.map((p) => ({
            message_id: newMessage.id,
            user_id: p.user_id,
            status: "sent",
        }));

        if (messageStatuses.length > 0) {
            await MessageStatus.bulkCreate(messageStatuses);
        }

        await Promise.all(
            receiverParticipants.map(async (participant) => {
                participant.unread_count = (participant.unread_count || 0) + 1;
                await participant.save();
            })
        );

        conversation.last_message_id = newMessage.id;
        await conversation.save();

        const fullMessage = await Message.findOne({
            where: { id: newMessage.id },
            include: [{ model: MessageAttachment, as: "attachments" }],
        });

        const responseData = {
            ...fullMessage?.toJSON(),
            sender: {
                id: req.user.id,
                full_name: req.user.full_name,
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

        await DELETE_CONVERSATION_CACHE(false)

        return res.json(
            new ApiResponse(200, responseData, "Message with attachments sent")
        );
    }
);


export const delete_conversation = asyncHandler(async (req: Request, res: Response) => {
    const conversationId = parseInt(req.params.id);
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(conversationId);

    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }

    const isParticipant = await ConversationParticipant.findOne({
        where: {
            conversation_id: conversationId,
            user_id: userId,
        },
    });

    if (!isParticipant) {
        throw new ApiError(403, "Not authorized to delete this conversation");
    }

    await conversation.destroy();

    await DELETE_CONVERSATION_CACHE(true)

    return res.json(new ApiResponse(200, null, "Conversation deleted successfully"));
});

export const react_to_message = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  if (!emoji) throw new ApiError(400, "Emoji is required");

  const message = await Message.findByPk(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  const isParticipant = await ConversationParticipant.findOne({
    where: { conversation_id: message.conversation_id, user_id: userId },
  });
  if (!isParticipant) throw new ApiError(403, "You are not part of this conversation");

  const existingReaction = await MessageReaction.findOne({
    where: {
      message_id: message.id,
      user_id: userId,
    },
  });

  let reaction;
  let created = false;

  if (existingReaction) {
    existingReaction.emoji = emoji;
    await existingReaction.save();
    reaction = existingReaction;
  } else {
    reaction = await MessageReaction.create({
      message_id: message.id,
      user_id: userId,
      emoji,
    });
    created = true;
  }

  await DELETE_CONVERSATION_CACHE(false);

  return res.json(
    new ApiResponse(200, { reaction }, created ? "Reaction added" : "Reaction updated")
  );
});


export const remove_reaction_from_message = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    const deleted = await MessageReaction.destroy({
        where: { message_id: messageId, user_id: userId },
    });

    if (!deleted) throw new ApiError(404, "Reaction not found");

    await DELETE_CONVERSATION_CACHE(false)

    return res.json(new ApiResponse(200, null, "Reaction removed"));
});

export const reply_to_message = asyncHandler(async (req: Request, res: Response) => {
    const { parentMessageId } = req.params;
    const { content, key_for_sender, key_for_recipient, receiver_id } = req.body;
    const userId = req.user.id;

    if (!content) throw new ApiError(400, "Content is required");

    const parentMessage = await Message.findByPk(parentMessageId);
    if (!parentMessage) throw new ApiError(404, "Original message not found");

    const isParticipant = await ConversationParticipant.findOne({
        where: { conversation_id: parentMessage.conversation_id, user_id: userId },
    });
    if (!isParticipant) throw new ApiError(403, "You are not part of this conversation");

    const reply = await Message.create({
        conversation_id: parentMessage.conversation_id,
        sender_id: userId,
        parent_message_id: parentMessage.id,
        content,
        key_for_sender,
        key_for_recipient,
        sent_at: new Date(),
        is_deleted: false,
    });

    await MessageStatus.create({
        message_id: reply.id,
        user_id: Number(receiver_id),
        status: "sent",
    });

    await DELETE_CONVERSATION_CACHE(false)

    return res.json(new ApiResponse(201, { reply }, "Reply sent successfully"));
});

export const edit_message = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content, key_for_recipient, key_for_sender } = req.body;
  const userId = req.user.id;

  if (!content)
    throw new ApiError(400, "Content is required");

  const message = await Message.findByPk(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  if (message.sender_id !== userId)
    throw new ApiError(403, "You can only edit your own messages");

  if (message.is_deleted)
    throw new ApiError(400, "Cannot edit a deleted message");

  message.content = content;
  message.key_for_recipient = key_for_recipient;
  message.key_for_sender = key_for_sender;
  message.is_updated = true;
  await message.save();

  await DELETE_CONVERSATION_CACHE(false);

  return res.json(new ApiResponse(200, { message }, "Message updated"));
});

export const delete_message = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findByPk(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  const isParticipant = await ConversationParticipant.findOne({
    where: {
      conversation_id: message.conversation_id,
      user_id: userId,
    },
  });

  if (!isParticipant)
    throw new ApiError(403, "You are not part of this conversation");

  if (message.sender_id !== userId)
    throw new ApiError(403, "You can only delete your own messages");

  if (message.is_deleted)
    throw new ApiError(400, "Message already deleted");

  message.is_deleted = true;
  message.deleted_by_id = userId;
  message.deleted_at = new Date();

  await message.save();

  await DELETE_CONVERSATION_CACHE(false);

  return res.json(new ApiResponse(200, {}, "Message deleted"));
});

export const undo_delete_message = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findByPk(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  if (message.sender_id !== userId)
    throw new ApiError(403, "You can only restore your own messages");

  if (!message.is_deleted)
    throw new ApiError(400, "Message is not deleted");

  message.is_deleted = false;
  message.deleted_at = null;
  message.deleted_by_id = null;

  await message.save();

  await DELETE_CONVERSATION_CACHE(false);

  return res.json(new ApiResponse(200, {}, "Message restored"));
});

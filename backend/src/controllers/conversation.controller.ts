import { MESSAGE_USER, SocketEventEnum } from "@/constants";
import { Conversation, ConversationParticipant, Message, MessageReaction, MessageStatus, User } from "@/models";
import { emitSocketEvent } from "@/socket";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import uploadFileOnCloudinary from "@/utils/cloudinary";
import { formatConversations } from "@/utils/formater";
import { formatTimeAgo } from "@/utils/helper";
import { Request, Response } from "express";
import { Op } from "sequelize";


export const create_conversation_for_dm = asyncHandler(async (req: Request, res: Response) => {

    const creatorId = Number(req.user.id)
    const { receiverId, type, content, messageType } = req.body
    const receiverIdNum = Number(receiverId)

    if (creatorId === receiverIdNum) throw new ApiError(400, "You can't create conversation your self")

    const minId = Math.min(creatorId, receiverIdNum)
    const maxId = Math.max(creatorId, receiverIdNum)
    const canonicalKey = `${minId}_${maxId}`

    const conversation = await Conversation.findOne({ where: { user_pair_key: canonicalKey } })
    if (conversation) return res.json(new ApiResponse(200, conversation, 'Already have an conversation'))

    const newConversation = await Conversation.create({
        user_pair_key: canonicalKey,
        type,
        created_by: creatorId
    })

    await ConversationParticipant.bulkCreate([
        { conversation_id: newConversation.id, user_id: creatorId, unread_count: 0 },
        { conversation_id: newConversation.id, user_id: receiverIdNum, unread_count: 1 },
    ])

    const receiverUser = await User.findByPk(receiverIdNum)

    const newMessage = await Message.create({
        conversation_id: newConversation.id,
        sender_id: creatorId,
        content,
        type: messageType,
        sent_at: Date.now()
    })

    await MessageStatus.create({
        message_id: newMessage.id,
        user_id: receiverIdNum,
        status:'sent'
    })

    newConversation.last_message_id = newMessage.id

    await newConversation.save()

    const responseData = {
        id: newConversation.id,
        type: newConversation.type,
        name: receiverUser?.full_name,
        time: formatTimeAgo(new Date(newMessage?.sent_at), true),
        avatar: req.user.avatar,
        lastMessage: {
            id: newMessage.id,
            sender: {
                id: req.user.id,
                username: req.user.username,
                full_name: req.user.full_name,
                avatar: req.user.avatar,
            },
            content: newMessage.content,
            type: newMessage.type,
            sent_at: newMessage.sent_at,
        },
        unreadCount: 0,
        isMuted: false,
    }

    emitSocketEvent({ req, roomId: `${receiverId}`, event: SocketEventEnum.SEND_CONVERSATION_REQUEST, payload: { ...responseData, name: req.user.full_name, unreadCount: 1} })

    return res.json(
        new ApiResponse(200, responseData, 'Conversation Created')
    )

})


export const get_all_conversations = asyncHandler(async (req: Request, res: Response) => {

    const page = parseInt(req.params?.page as string) || 1
    const limit = parseInt(req.params?.limit as string) || 10
    const skip = (page - 1) * limit


    const { count, rows } = await ConversationParticipant.findAndCountAll({
        where: {
            user_id: req.user.id,
            is_archived: null,
            left_at: { [Op.is]: null }
        },
        include: [
            {
                model: Conversation,
                as: 'conversation',
                attributes: ['id', 'name', 'type', 'last_message_id'],
                include: [
                    {
                        model: Message,
                        as: 'lastMessage',
                        attributes: ['id', 'sender_id', 'content', 'sent_at', 'type'],
                        include: [
                            {
                                model: User,
                                as: 'sender',
                                attributes: MESSAGE_USER
                            }
                        ],
                        required: false
                    },
                    {
                        model: ConversationParticipant,
                        as: 'participants',
                        attributes: ['user_id', 'unread_count'],
                        where: { user_id: { [Op.ne]: req.user.id } },
                        required: false,
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: MESSAGE_USER
                            }
                        ],
                    }

                ],
            }
        ],
        order: [
            [
                { model: Conversation, as: 'conversation' },
                { model: Message, as: 'lastMessage' },
                'sent_at',
                'DESC'
            ]
        ],
        limit,
        offset: skip,
        distinct: true
    })

    const responseData = formatConversations(rows)

    return res.json(
        new ApiResponse(200, {
            conversations: responseData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalConversations: count,
        }, 'Success')
    )

})

export const get_conversation_message = asyncHandler(async (req: Request, res: Response) => {

    const conversationId = req.params.id
    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit) || 30
    const skip = (page - 1) * limit

    const conversation = await Conversation.findByPk(conversationId)
    if (!conversation) throw new ApiError(404, 'Conversation not found')

    const participant = await ConversationParticipant.findOne({
        where: {
            user_id: req.user.id,
            conversation_id: conversationId
        }
    })

    if (!participant) throw new ApiError(403, 'You are not participant of this conversation ')

    const { rows, count } = await Message.findAndCountAll({
        where: {
            conversation_id: conversationId
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: MESSAGE_USER
            },
            {
                model: MessageReaction,
                as: 'reactions'
            },
            {
                model: MessageStatus,
                as: 'statuses',
                where: { user_id: req.user.id  },
                required: false,
                attributes: ['status']
            }
        ],
        order: [['sent_at', 'ASC']],
        limit,
        offset: skip
    })


    return res.json(
        new ApiResponse(200, {
            messages: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }, 'Success')
    )
})

export const send_message = asyncHandler(async (req: Request, res: Response) => {

    const { conversationId, content, type } = req.body
    const senderId = req.user.id

    const conversation = await Conversation.findOne({ where: { id: conversationId } })
    if (!conversation) throw new ApiError(404, 'Conversation not found')

    const participant = await ConversationParticipant.findOne({
        where: {
            conversation_id: conversationId,
            user_id: req.user.id
        }
    });

    if (!participant) {
        throw new ApiError(403, 'You are not a participant in this conversation');
    }

    const allParticipants = await ConversationParticipant.findAll({
        where: { conversation_id: conversationId },
        include: [{
            model: User,
            as: 'user',
            attributes: MESSAGE_USER
        }]
    });

    const receiverParticipants = allParticipants.filter(p => p.user_id !== senderId);

    if (receiverParticipants.length === 0 && conversation.type === 'direct') {
        throw new ApiError(400, 'Direct message conversation must have another participant.');
    }

    const newMessage = await Message.create({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type,
        sent_at: new Date()
    })

    const messageStatuses = receiverParticipants.map(participant => ({
        message_id: newMessage.id,
        user_id: participant.user_id,
        status: 'sent'
    }));

    if (messageStatuses.length > 0) {
        await MessageStatus.bulkCreate(messageStatuses);
    }


    await Promise.all(receiverParticipants.map(async (participant) => {
        participant.unread_count = (participant.unread_count || 0) + 1; 
        await participant.save();
    }));

    conversation.last_message_id = newMessage.id;
    await conversation.save();

    const responseData = {
        ...newMessage.toJSON(),
        sender: {
            full_name: req.user.full_name,
            avatar: req.user.avatar,
            id: req.user.id,
            username: req.user.username
        },
        statuses: [
            {
                "status": "sent"
            }
        ]
    }

    emitSocketEvent({ req, roomId: `conversation_${conversationId}`, event: SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION, payload: responseData })


    return res.json(
        new ApiResponse(200, responseData, 'success')
    )
})

export const read_message = asyncHandler(async(req:Request, res:Response) =>{

    const { messageId, conversationId } = req.body

    const conversation = await Conversation.findOne({ 
        where: {id: conversationId}
    })

    if(!conversation) throw new ApiError(404, 'Conversation not found')

    const participant = await ConversationParticipant.findOne({
        where:{
            user_id: req.user.id,
            conversation_id: conversationId
        }
    })

    if(!participant) throw new ApiError(403, 'You are not participant of this conversation')

        await MessageStatus.update(
        { status: 'seen' },
        {
            where: {
            user_id: req.user.id,
            status: { [Op.ne]: 'seen' }
            }
        }
        );


    participant.unread_count = 0
    participant.last_read_message_id = messageId

    await participant.save()

    return res.json(
        new ApiResponse(200, null, 'Success')
    )
})

export const send_attachment = asyncHandler(async (req: Request, res: Response) => {

    const mediaPath = req?.file?.path
    const { conversationId, type } = req.body
    const senderId = req.user.id

    const conversation = await Conversation.findOne({ where: { id: conversationId } })
    if (!conversation) throw new ApiError(404, 'Conversation not found')

    const participant = await ConversationParticipant.findOne({
        where: {
            conversation_id: conversationId,
            user_id: req.user.id
        }
    });
    if (!participant) {
        throw new ApiError(403, 'You are not a participant in this conversation');
    }

    const allParticipants = await ConversationParticipant.findAll({
        where: { conversation_id: conversationId },
        include: [{
            model: User,
            as: 'user',
            attributes: MESSAGE_USER
        }]
    });

    const receiverParticipants = allParticipants.filter(p => p.user_id !== senderId);

    if (receiverParticipants.length === 0 && conversation.type === 'direct') {
        throw new ApiError(400, 'Direct message conversation must have another participant.');
    }

    let media_url = null
    if (mediaPath) {
        const media = await uploadFileOnCloudinary(
            mediaPath,
            "ummah_connect/message_attachment"
        );
        media_url = media
    }

    const newMessage = await Message.create({
        conversation_id: conversationId,
        content: media_url,
        type,
        sender_id: senderId,
        sent_at: new Date()
    })

    const messageStatuses = receiverParticipants.map(participant => ({
        message_id: newMessage.id,
        user_id: participant.id,
        status: 'sent'
    }));

    if (messageStatuses.length > 0) {
        await MessageStatus.bulkCreate(messageStatuses);
    }

    await Promise.all(receiverParticipants.map(async (participant) => {
        participant.unread_count = (participant.unread_count || 0) + 1; 
        await participant.save();
    }));

    conversation.last_message_id = newMessage.id;
    await conversation.save();


    const responseData = {
        ...newMessage.toJSON(),
        sender: {
            full_name: req.user.full_name,
            avatar: req.user.avatar,
            id: req.user.id,
            username: req.user.username
        }
    }

    emitSocketEvent({ req, roomId: `conversation_${conversationId}`, event: SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION, payload: responseData })


    return res.json(
        new ApiResponse(200, responseData, 'success')
    )
})
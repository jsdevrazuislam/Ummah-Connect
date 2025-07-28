import { z } from 'zod'

export const conversationSchema = z.object({
    receiverId: z.string().min(1, 'Receiver Id required!'),
    content: z.string().min(1, 'Content is required!'),
    type: z.string().min(1, 'Conversation type is required!'),
})

export const sendMessageSchema = z.object({
    conversationId: z.number().min(1, 'required!'),
    content: z.string().min(1, 'Content is required!')
})
export const readMessageSchema = z.object({
    conversationId: z.number().min(1, 'Conversation Id required!'),
    messageId: z.number().min(1, 'Message Id is required!'),
})
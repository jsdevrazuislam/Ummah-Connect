import { z } from "zod";

export const startLiveStreamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  enableChat: z.boolean().optional().default(true),
  saveRecording: z.boolean().optional().default(false),
  notifyFollowers: z.boolean().optional().default(true),
});

export const chatMessageSchema = z.object({
  streamId: z.number(),
  senderId: z.number(),
  content: z.string().min(1).max(1000),
});

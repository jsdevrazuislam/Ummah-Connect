import { z } from "zod";

export const startLiveStreamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  enable_chat: z.boolean().optional().default(true),
  save_recording: z.boolean().optional().default(false),
  notify_followers: z.boolean().optional().default(true),
});

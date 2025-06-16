import * as z from "zod";

export const streamSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100),
  description: z.string().min(1, 'Description required').max(500),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().max(100).optional(),
  enable_chat: z.boolean().default(true),
  save_recording: z.boolean().default(true),
  notify_followers: z.boolean().default(true),
});

export type StreamFormData = z.infer<typeof streamSchema>;

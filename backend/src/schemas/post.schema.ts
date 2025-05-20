import { z } from 'zod';

export const postSchema = z.object({
  media: z.any().optional(),
  content: z.string().optional(),
  privacy: z.string().min(1, 'Post mode required!'),
  location: z.string().optional(),
});


export const commentSchema = z.object({
    content: z.string().min(1, "Required")
})
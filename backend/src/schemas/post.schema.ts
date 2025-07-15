import { z } from 'zod';

export const postSchema = z.object({
  media: z.any().optional(),
  content: z.string().optional(),
  privacy: z.string().min(1, 'Post mode required!'),
  location: z.string().optional(),
  background: z.string().optional(),
});


export const commentSchema = z.object({
    content: z.string().min(1, "is Required"),
})

export const commentReplySchema = z.object({
    content: z.string().min(1, "Required"),
    postId: z.number().min(1, "Required"),
})

export const reactSchema = z.object({
    react_type: z.string().optional(),
    icon: z.string().optional()
})
import * as z from "zod";

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

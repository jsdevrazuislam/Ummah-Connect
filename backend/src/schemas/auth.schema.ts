import { z } from 'zod';

export const userRegistrationSchema = z.object({
  username: z.string().min(1, "username is required").transform((s) => s.toLowerCase()),
  full_name: z.string().min(3, "name is required"),
  email: z.string().email("invalid email").transform((s) => s.toLowerCase()),
  password: z.string().min(8, "password must be at least 8 characters "),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "emailOrUsername is required").transform((s) => s.toLowerCase()),
  password: z.string().min(8, "password must be at least 8 characters "),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "password must be at least 8 characters "),
  newPassword: z.string().min(8, "password must be at least 8 characters ")
})
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

export const loginRecoverSchema = z.object({
  emailOrUsername: z.string().min(1, "emailOrUsername is required").transform((s) => s.toLowerCase()),
  recoveryCode: z.string().min(16, "code must be at least 16 characters "),
});

export const emailSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
});

export const email2FALoginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  otpCode: z.string().min(6, "code must be at least 6 characters "),
});

export const userStatusSchema = z.object({
  userId: z.number().min(1, 'User Id Required'),
  status: z.string().min(1, "Status is required"),
});

export const tokenSchema = z.object({
  token: z.string().min(6, "token must be at least 6 digit ")
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "password must be at least 8 characters "),
  newPassword: z.string().min(8, "password must be at least 8 characters ")
})
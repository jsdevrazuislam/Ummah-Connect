import * as z from "zod";

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required!'),
  username: z.string().min(1, 'Username is required!'),
  last_name: z.string().min(1, 'Last name is required!'),
  email: z.string().email('Invalid Email'),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service and Privacy Policy to proceed.",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export const userProfileSchema = z.object({
  full_name: z.string().min(1, 'First name is required!'),
  username: z.string().min(1, 'Username is required!'),
  email: z.string().email('Invalid Email'),
  gender: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatar: z.any().optional(),
  cover: z.any().optional(),
  website: z.string()
    .url("Invalid URL format. Please enter a valid website address.")
    .or(z.literal(''))
    .optional()
})

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof registerSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;

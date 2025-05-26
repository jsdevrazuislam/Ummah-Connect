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

export const privacySettingsSchema = z.object({
  private_account: z.boolean().default(false),
  active_status: z.boolean().default(false),
  read_receipts: z.boolean().default(false),
  location_share: z.boolean().default(false),
  post_see: z.string().default('everyone'),
  message: z.string().default('followers'),
});

export const notificationPreferenceSchema = z.object({
  push_notification: z.boolean().default(false),
  email_notification: z.boolean().default(false),
  prayer_time_notification: z.boolean().default(false),
  like_post: z.boolean().default(false),
  comment_post: z.boolean().default(false),
  mention: z.boolean().default(false),
  new_follower: z.boolean().default(false),
  dm: z.boolean().default(false),
  islamic_event: z.boolean().default(false),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 characters long."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long."),
})
.refine((data) => data.oldPassword !== data.newPassword, {
  message: "New password cannot be the same as the old password.",
  path: ["newPassword"], 
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password do not match.",
  path: ["confirmPassword"], 
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type NotificationPreferenceFormData = z.infer<typeof notificationPreferenceSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof registerSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type PrivacyFormData = z.infer<typeof privacySettingsSchema>;

import { z } from "zod";

const passwordComplexityRegex
  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};:'",.<>/?`~])[\w!@#$%^&*()+\-=[\]{};:'",.<>/?`~]{8,}$/;

const passwordErrorMessage
  = "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.";

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or Username is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordComplexityRegex, passwordErrorMessage),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required!"),
    username: z.string().min(1, "Username is required!"),
    lastName: z.string().min(1, "Last name is required!"),
    email: z.string().email("Invalid Email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordComplexityRegex, passwordErrorMessage),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy to proceed.",
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const userProfileSchema = z.object({
  fullName: z.string().min(1, "First name is required!"),
  username: z.string().min(1, "Username is required!"),
  email: z.string().email("Invalid Email"),
  gender: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatar: z.any().optional(),
  cover: z.any().optional(),
  website: z.string()
    .url("Invalid URL format. Please enter a valid website address.")
    .or(z.literal(""))
    .optional(),
});

export const privacySettingsSchema = z.object({
  privateAccount: z.boolean().default(false),
  activeStatus: z.boolean().default(false),
  readReceipts: z.boolean().default(false),
  locationShare: z.boolean().default(false),
  postSee: z.string().default("everyone"),
  message: z.string().default("followers"),
});

export const notificationPreferenceSchema = z.object({
  pushNotification: z.boolean().default(false),
  emailNotification: z.boolean().default(false),
  prayerTimeNotification: z.boolean().default(false),
  likePost: z.boolean().default(false),
  commentPost: z.boolean().default(false),
  mention: z.boolean().default(false),
  newFollower: z.boolean().default(false),
  dm: z.boolean().default(false),
  islamicEvent: z.boolean().default(false),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 characters long."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long."),
})
  .refine(data => data.oldPassword !== data.newPassword, {
    message: "New password cannot be the same as the old password.",
    path: ["newPassword"],
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ["confirmPassword"],
  });

export const loginRecoverySchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required."),
  recoveryCode: z.string().optional(),
  otp: z.string().optional(),
  activeMethod: z.enum(["recovery", "otp"], {
    // eslint-disable-next-line camelcase
    required_error: "An active method (recovery or OTP) must be selected.",
  }).default("recovery"),
}).superRefine((data, ctx) => {
  if (data.activeMethod === "recovery") {
    if (data?.recoveryCode?.length !== 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recovery code must be 16 characters long.",
        path: ["recoveryCode"],
      });
    }
  }
  else if (data.activeMethod === "otp") {
    if (data?.otp?.length !== 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "OTP code must be 6 digits long.",
        path: ["otp"],
      });
    }
  }
});

export type RecoveryLoginFormData = z.infer<typeof loginRecoverySchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type NotificationPreferenceFormData = z.infer<typeof notificationPreferenceSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof registerSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type PrivacyFormData = z.infer<typeof privacySettingsSchema>;

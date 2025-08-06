import { Router } from "express";

import { changePassword, deleteAccount, disable2FA, discoverPeople, enable2FA, getMe, getPlaceName, getUserDetails, getUserProfile, loginWith2FA, logout, recover2FA, register, requestEmailOtp, updateCurrentUserInfo, updateNotificationPreferences, updatePrivacySettings, verify2FA, verify2FAOtp, verifyEmail } from "@/controllers/auth.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";
import { validateData } from "@/middleware/validation.middleware";
import { changePasswordSchema, email2FALoginSchema, emailSchema, loginRecoverSchema, loginSchema, tokenSchema, userRegistrationSchema } from "@/schemas/auth.schema";

const router = Router();
router.post("/register", validateData(userRegistrationSchema), register);
router.get("/verify-email", verifyEmail);
router.get("/reverse-geocode", getPlaceName);
router.post("/login", validateData(loginSchema), loginWith2FA);
router.post("/recover-login", validateData(loginRecoverSchema), recover2FA);
router.get("/logout", logout);
router.get("/me", verifyAuth, getMe);
router.put("/me", verifyAuth, upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "avatar", maxCount: 1 },
]), updateCurrentUserInfo);
router.get("/:username/profile", verifyAuth, getUserProfile);
router.get("/:username/details", verifyAuth, getUserDetails);
router.post("/change-password", validateData(changePasswordSchema), verifyAuth, changePassword);
router.post("/privacy-settings", verifyAuth, updatePrivacySettings);
router.post("/notification-preference", verifyAuth, updateNotificationPreferences);
router.post("/2fa/enable", verifyAuth, enable2FA);
router.post("/2fa/verify", validateData(tokenSchema), verifyAuth, verify2FA);
router.post("/2fa/disable", verifyAuth, disable2FA);
router.post("/request-otp", validateData(emailSchema), requestEmailOtp);
router.post("/2fa/email-verify", validateData(email2FALoginSchema), verify2FAOtp);
router.get("/discover-people", verifyAuth, discoverPeople);
router.delete("/account-delete", verifyAuth, deleteAccount);

export default router;

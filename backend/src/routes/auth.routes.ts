import { change_password, disable_2FA, enable_2FA, get_me, get_user_details, get_user_profile, login_with_2FA, logout, recover_2FA, register, request_email_otp, update_current_user_info, update_notification_preferences, update_privacy_settings, verify_2FA, verify_2FA_otp, verify_email } from '@/controllers/auth.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { changePasswordSchema, email2FALoginSchema, emailSchema, loginRecoverSchema, loginSchema, tokenSchema, userRegistrationSchema, userStatusSchema } from '@/schemas/auth.schema'
import { Router } from 'express'


const router = Router()
router.post("/register", validateData(userRegistrationSchema), register)
router.get("/verify-email", verify_email)
router.post("/login", validateData(loginSchema), login_with_2FA)
router.post("/recover-login", validateData(loginRecoverSchema), recover_2FA)
router.get("/logout", logout)
router.get("/me", verify_auth, get_me)
router.put("/me", verify_auth, upload.fields([
    {name:"cover", maxCount:1},
    {name:"avatar", maxCount:1},
]), update_current_user_info)
router.get("/:username/profile", get_user_profile)
router.get("/:username/details", get_user_details)
router.post("/change-password", validateData(changePasswordSchema), verify_auth, change_password)
router.post("/privacy-settings", verify_auth, update_privacy_settings)
router.post("/notification-preference", verify_auth, update_notification_preferences)
router.post("/2fa/enable", verify_auth, enable_2FA)
router.post("/2fa/verify", validateData(tokenSchema), verify_auth, verify_2FA)
router.post("/2fa/disable", verify_auth, disable_2FA)
router.post("/request-otp", validateData(emailSchema), request_email_otp)
router.post("/2fa/email-verify", validateData(email2FALoginSchema), verify_2FA_otp)


export default router


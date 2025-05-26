import { change_password, get_me, get_user_details, get_user_profile, login, logout, register, update_current_user_info, update_notification_preferences, update_privacy_settings, verifyEmail } from '@/controllers/auth.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { changePasswordSchema, loginSchema, userRegistrationSchema } from '@/schemas/auth.schema'
import { Router } from 'express'


const router = Router()
router.post("/register", validateData(userRegistrationSchema), register)
router.get("/verify-email", verifyEmail)
router.post("/login", validateData(loginSchema), login)
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


export default router


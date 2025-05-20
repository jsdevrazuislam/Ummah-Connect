import { get_me, login, logout, register, verifyEmail } from '@/controllers/auth.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { loginSchema, userRegistrationSchema } from '@/schemas/auth.schema'
import { Router } from 'express'


const router = Router()
router.post("/register", validateData(userRegistrationSchema), register)
router.get("/verify-email", verifyEmail)
router.post("/login", validateData(loginSchema), login)
router.get("/logout", logout)
router.get("/me", verify_auth, get_me)


export default router


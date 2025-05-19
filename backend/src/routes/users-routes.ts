import { login, register, verifyEmail } from '@/controllers/auth.controller'
import { validateData } from '@/middleware/validation.middleware'
import { loginSchema, userRegistrationSchema } from '@/schemas/auth.schema'
import { Router } from 'express'


const router = Router()
router.post("/register", validateData(userRegistrationSchema), register)
router.get("/verify-email", verifyEmail)
router.post("/login", validateData(loginSchema), login)


export default router


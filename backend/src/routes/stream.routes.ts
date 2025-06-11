import { generate_livekit_token } from '@/controllers/stream.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { Router } from 'express'


const router = Router()
router.get("/get-token", verify_auth, generate_livekit_token)


export default router


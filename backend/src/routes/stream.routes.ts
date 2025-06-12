import { generate_livekit_token, initiate_call, validate_call_token } from '@/controllers/stream.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { Router } from 'express'


const router = Router()
router.get("/get-token", verify_auth, generate_livekit_token)
router.post("/initiate-call", verify_auth, initiate_call)
router.get("/validate-call-token", verify_auth, validate_call_token)


export default router


import { end_live_stream, generate_livekit_token, initiate_call, start_live_stream, validate_call_token } from '@/controllers/stream.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { startLiveStreamSchema } from '@/schemas/stream.schema'
import { Router } from 'express'


const router = Router()
router.get("/get-token", verify_auth, generate_livekit_token)
router.post("/initiate-call", verify_auth, initiate_call)
router.get("/validate-call-token", verify_auth, validate_call_token)
router.post("/start", validateData(startLiveStreamSchema), verify_auth, start_live_stream)
router.post("/end", verify_auth, end_live_stream)


export default router


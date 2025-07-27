import { end_live_stream, generate_livekit_token, get_active_lives, get_stream_chats, initiate_call, start_chat_live_stream, start_live_stream, stream_details, upload_short, validate_call_token, get_shorts, delete_short } from '@/controllers/stream.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { chatMessageSchema, startLiveStreamSchema } from '@/schemas/stream.schema'
import { Router } from 'express'


const router = Router()
router.get("/get-token", verify_auth, generate_livekit_token)
router.post("/initiate-call", verify_auth, initiate_call)
router.get("/validate-call-token", verify_auth, validate_call_token)
router.get("/", verify_auth, get_active_lives)
router.get("/details", verify_auth, stream_details)
router.post("/start", validateData(startLiveStreamSchema), verify_auth, start_live_stream)
router.post("/chat", validateData(chatMessageSchema), verify_auth, start_chat_live_stream)
router.get("/chats", verify_auth, get_stream_chats)
router.post("/end", verify_auth, end_live_stream)
router.post("/upload-short", verify_auth, upload.single('media'), upload_short)
router.get("/shorts", verify_auth, get_shorts)
router.delete("/short/:shortId", verify_auth, delete_short)

export const basePath = '/stream';
export default router


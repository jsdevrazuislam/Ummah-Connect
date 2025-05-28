import { create_conversation_for_dm, get_all_conversations, get_conversation_message, send_attachment, send_message } from '@/controllers/conversation.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { conversationSchema, sendMessageSchema } from '@/schemas/conversation.schema'
import { Router } from 'express'

const router = Router()

router.post("/create", validateData(conversationSchema), verify_auth, create_conversation_for_dm)
router.get("/", verify_auth, get_all_conversations)
router.post("/send-message", validateData(sendMessageSchema), verify_auth, send_message)
router.post("/send-attachment", verify_auth, upload.single("media"), send_attachment)
router.get("/:id", verify_auth, get_conversation_message)


export default router
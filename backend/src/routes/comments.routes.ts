import { create_comment, create_reply_comment, edit_comment } from '@/controllers/comment.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { commentReplySchema, commentSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/:id", validateData(commentSchema), verify_auth, create_comment)
router.post("/reply/:id", validateData(commentReplySchema), verify_auth, create_reply_comment)
router.post("/edit/:id", validateData(commentReplySchema), verify_auth, edit_comment)

export default router
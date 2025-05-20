import { create_comment } from '@/controllers/comment.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { commentSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/:id", validateData(commentSchema), verify_auth, create_comment)

export default router
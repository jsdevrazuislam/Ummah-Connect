import { comment_react, create_comment, create_reply_comment, delete_comment, edit_comment, get_comments } from '@/controllers/comment.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { commentReplySchema, commentSchema, reactSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/:id", validateData(commentSchema), verify_auth, create_comment)
router.post("/reply/:id", validateData(commentReplySchema), verify_auth, create_reply_comment)
router.post("/edit/:id", validateData(commentReplySchema), verify_auth, edit_comment)
router.post("/react/:commentId", validateData(reactSchema), verify_auth, comment_react)
router.delete("/delete/:id", verify_auth, delete_comment)
router.get("/:postId/comments", verify_auth, get_comments)

export default router
import { create_post, get_posts } from '@/controllers/post.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { postSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/" ,verify_auth, upload.single("media"), create_post)
router.get("/" , get_posts)

export default router
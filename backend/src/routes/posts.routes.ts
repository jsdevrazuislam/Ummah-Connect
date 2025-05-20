import { create_post, get_posts, post_react, share } from '@/controllers/post.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { reactSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/" ,verify_auth, upload.single("media"), create_post)
router.get("/" , get_posts)
router.post("/react/:postId" , validateData(reactSchema), verify_auth, post_react)
router.get("/share/:postId", share)

export default router
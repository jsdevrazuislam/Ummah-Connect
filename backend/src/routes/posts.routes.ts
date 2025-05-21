import { bookmarked_post, create_post, delete_post, edit_post, get_posts, post_react, share } from '@/controllers/post.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { reactSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/" ,verify_auth, upload.single("media"), create_post)
router.get("/" , verify_auth, get_posts)
router.post("/react/:postId" , validateData(reactSchema), verify_auth, post_react)
router.get("/share/:postId", verify_auth, share)
router.get("/bookmark/:postId", verify_auth, bookmarked_post)
router.put("/edit/:postId", verify_auth, edit_post)
router.delete("/delete/:postId", verify_auth, delete_post)

export default router
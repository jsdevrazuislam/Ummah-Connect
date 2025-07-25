import { bookmarked_post, create_post, delete_post, delete_post_image, edit_post, get_bookmark_posts, get_following_posts, get_posts, get_single_post, post_react, share, user_suggestion } from '@/controllers/post.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { validateData } from '@/middleware/validation.middleware'
import { reactSchema } from '@/schemas/post.schema'
import { Router } from 'express'

const router = Router()

router.post("/", verify_auth, upload.single("media"), create_post)
router.get("/" , verify_auth, get_posts)
router.get("/post-details/:id" , verify_auth, get_single_post)
router.post("/react/:postId" , validateData(reactSchema), verify_auth, post_react)
router.post("/share/:postId", verify_auth, share)
router.post("/bookmark/:postId", verify_auth, bookmarked_post)
router.get("/bookmark/posts", verify_auth, get_bookmark_posts)
router.put("/edit/:postId", verify_auth,  upload.single("media"),  edit_post)
router.delete("/delete/:postId", verify_auth, delete_post)
router.delete("/delete/media/:postId", verify_auth, delete_post_image)
router.get("/following/posts", verify_auth, get_following_posts)
router.get("/suggest", verify_auth, user_suggestion)


export const basePath = '/post';
export default router
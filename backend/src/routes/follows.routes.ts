import { followUnFollow } from '@/controllers/follows.controller'
import { deleteStory, getActiveStories, uploadStory } from '@/controllers/story.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { upload } from '@/middleware/multer.middleware'
import { Router } from 'express'

const router = Router()

router.post("/:id", verify_auth, followUnFollow)
router.post("/story/create", verify_auth, upload.single("media"), uploadStory)
router.get("/stories", verify_auth, getActiveStories)
router.delete("/story/:id", verify_auth, deleteStory)

export const basePath = '/follow';
export default router
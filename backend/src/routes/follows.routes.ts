import { Router } from "express";

import { followUnFollow } from "@/controllers/follows.controller";
import { deleteStory, getActiveStories, uploadStory } from "@/controllers/story.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";

const router = Router();

router.post("/:id", verifyAuth, followUnFollow);
router.post("/story/create", verifyAuth, upload.single("media"), uploadStory);
router.get("/stories", verifyAuth, getActiveStories);
router.delete("/story/:id", verifyAuth, deleteStory);

export default router;

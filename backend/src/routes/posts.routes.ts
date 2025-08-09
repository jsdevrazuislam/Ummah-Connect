import { Router } from "express";

import { bookmarkedPost, createPost, deletePost, deletePostImage, editPost, getBookmarkPosts, getFollowingPosts, getMyPosts, getPosts, getSinglePost, postReact, share, userSuggestion } from "@/controllers/post.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";
import { validateData } from "@/middleware/validation.middleware";
import { reactSchema } from "@/schemas/post.schema";

const router = Router();

router.post("/", verifyAuth, upload.single("media"), createPost);
router.get("/", verifyAuth, getPosts);
router.get("/post-details/:id", verifyAuth, getSinglePost);
router.post("/react/:postId", validateData(reactSchema), verifyAuth, postReact);
router.post("/share/:postId", verifyAuth, share);
router.post("/bookmark/:postId", verifyAuth, bookmarkedPost);
router.get("/bookmark/posts", verifyAuth, getBookmarkPosts);
router.put("/edit/:postId", verifyAuth, upload.single("media"), editPost);
router.delete("/delete/:postId", verifyAuth, deletePost);
router.delete("/delete/media/:postId", verifyAuth, deletePostImage);
router.get("/following/posts", verifyAuth, getFollowingPosts);
router.get("/suggest", verifyAuth, userSuggestion);
router.get("/my-post", verifyAuth, getMyPosts);

export default router;

import { Router } from "express";

import { commentReact, createComment, createReplyComment, deleteComment, editComment, getComments } from "@/controllers/comment.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { validateData } from "@/middleware/validation.middleware";
import { commentReplySchema, commentSchema, reactSchema } from "@/schemas/post.schema";

const router = Router();

router.post("/:id", validateData(commentSchema), verifyAuth, createComment);
router.post("/reply/:id", validateData(commentReplySchema), verifyAuth, createReplyComment);
router.post("/edit/:id", validateData(commentReplySchema), verifyAuth, editComment);
router.post("/react/:commentId", validateData(reactSchema), verifyAuth, commentReact);
router.delete("/delete/:id", verifyAuth, deleteComment);
router.get("/:postId/comments", verifyAuth, getComments);

export default router;

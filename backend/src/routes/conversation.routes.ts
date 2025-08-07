import { Router } from "express";

import { createConversationForDm, deleteConversation, deleteMessage, editMessage, getAllConversations, getConversationMessage, reactToMessage, readMessage, removeReactionFromMessage, replyToMessage, sendAttachment, sendMessage, undoDeleteMessage } from "@/controllers/conversation.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";
import { validateData } from "@/middleware/validation.middleware";
import { conversationSchema, readMessageSchema, sendMessageSchema } from "@/schemas/conversation.schema";

const router = Router();

router.post("/create", validateData(conversationSchema), verifyAuth, createConversationForDm);
router.get("/", verifyAuth, getAllConversations);
router.post("/send-message", validateData(sendMessageSchema), verifyAuth, sendMessage);
router.post("/send-attachment", verifyAuth, upload.array("media", 10), sendAttachment);
router.get("/:id", verifyAuth, getConversationMessage);
router.post("/read-message", validateData(readMessageSchema), verifyAuth, readMessage);
router.delete("/delete/:id", verifyAuth, deleteConversation);
router.post("/react/:messageId", verifyAuth, reactToMessage);
router.delete("/react/:messageId", verifyAuth, removeReactionFromMessage);
router.post("/reply/:parentMessageId", verifyAuth, replyToMessage);
router.put("/edit/:messageId", verifyAuth, editMessage);
router.delete("/message/delete/:messageId", verifyAuth, deleteMessage);
router.post("/message/undo/:messageId", verifyAuth, undoDeleteMessage);

export default router;

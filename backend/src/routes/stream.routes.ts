import { Router } from "express";

import { deleteShort, endLiveStream, getActiveLives, getShorts, getStreamChats, getStreamToken, initiateCall, startChatLiveStream, startLiveStream, streamDetails, uploadShort, validateCallToken } from "@/controllers/stream.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";
import { validateData } from "@/middleware/validation.middleware";
import { chatMessageSchema, startLiveStreamSchema } from "@/schemas/stream.schema";

const router = Router();
router.get("/get-token", verifyAuth, getStreamToken);
router.post("/initiate-call", verifyAuth, initiateCall);
router.get("/validate-call-token", verifyAuth, validateCallToken);
router.get("/", verifyAuth, getActiveLives);
router.get("/details", verifyAuth, streamDetails);
router.post("/start", validateData(startLiveStreamSchema), verifyAuth, startLiveStream);
router.post("/chat", validateData(chatMessageSchema), verifyAuth, startChatLiveStream);
router.get("/chats", verifyAuth, getStreamChats);
router.post("/end", verifyAuth, endLiveStream);
router.post("/upload-short", verifyAuth, upload.single("media"), uploadShort);
router.get("/shorts", verifyAuth, getShorts);
router.delete("/short/:shortId", verifyAuth, deleteShort);

export default router;

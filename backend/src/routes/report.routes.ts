import { Router } from "express";

import { banViewer, createReport } from "@/controllers/report.controller";
import { verifyAuth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";

const router = Router();

router.post("/", verifyAuth, upload.array("attachments", 3), createReport);
router.post("/ban/:id", verifyAuth, banViewer);

export default router;

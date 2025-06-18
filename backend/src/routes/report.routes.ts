import { Router } from "express";
import { ban_viewer, create_report } from "@/controllers/report.controller";
import { verify_auth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";

const router = Router();

router.post("/", verify_auth, upload.array("attachments", 3), create_report);
router.post("/ban/:id", verify_auth, ban_viewer);

export const basePath = '/report';
export default router;

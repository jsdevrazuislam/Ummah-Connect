import { Router } from "express";
import { create_report } from "@/controllers/report.controller";
import { verify_auth } from "@/middleware/auth.middleware";
import { upload } from "@/middleware/multer.middleware";

const router = Router();

router.post("/", verify_auth, upload.array("attachments", 3), create_report);

export const basePath = '/report';
export default router;

import { Router } from "express";

import { deleteNotification, getNotifications, markAllRead } from "@/controllers/notification.controller";
import { verifyAuth } from "@/middleware/auth.middleware";

const router = Router();
router.get("/", verifyAuth, getNotifications);
router.get("/mark-read", verifyAuth, markAllRead);
router.delete("/:id", verifyAuth, deleteNotification);

export default router;

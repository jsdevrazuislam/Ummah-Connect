import { deleteNotification, getNotifications, markAllRead } from '@/controllers/notification.controller';
import { verify_auth } from '@/middleware/auth.middleware'
import { Router } from 'express'


const router = Router()
router.get("/", verify_auth, getNotifications)
router.get("/mark-read", verify_auth, markAllRead)
router.delete("/:id", verify_auth, deleteNotification)

export const basePath = '/notification';
export default router


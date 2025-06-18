import { followUnFollow } from '@/controllers/follows.controller'
import { verify_auth } from '@/middleware/auth.middleware'
import { Router } from 'express'

const router = Router()

router.post("/:id", verify_auth, followUnFollow)

export const basePath = '/follow';
export default router
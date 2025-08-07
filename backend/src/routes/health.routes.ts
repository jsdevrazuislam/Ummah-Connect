import type { Request, Response } from "express";

import { Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is working fine...",
  });
});

export default router;

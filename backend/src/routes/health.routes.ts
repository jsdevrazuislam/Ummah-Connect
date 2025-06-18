import { Response, Router, Request } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is working fine...",
  });
});

export const basePath = '/health-check';

export default router;

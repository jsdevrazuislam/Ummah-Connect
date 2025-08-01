import type { NextFunction, Request, Response } from "express";

import ApiError from "@/utils/api-error";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.log("App Error", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    success: false,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

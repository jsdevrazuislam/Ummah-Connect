import ApiError from "@/utils/ApiError";
import { Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response
) => {

console.log("💥 Error middleware triggered");


  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    success: false,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

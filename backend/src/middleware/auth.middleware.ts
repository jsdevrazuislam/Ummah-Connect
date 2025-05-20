import asyncHandler from "@/utils/async-handler";
import ApiError from "@/utils/ApiError";
import { User } from "@/models";
import { NextFunction, Request, Response } from "express";
import { decode_token } from "@/utils/auth-helper";
import { JwtResponse } from "@/types/auth";

export const verify_auth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.access_token ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) throw new ApiError(404, "Invalid access token");
    const decode_jwt = decode_token(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtResponse;
    const user = await User.findOne({
      where: { id: decode_jwt.id },
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new ApiError(404, "User not found in jwt");

    req.user = user;
    next();
  }
);

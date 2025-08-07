import type { NextFunction, Request, Response } from "express";

import type { JwtResponse } from "@/types/auth";

import { User } from "@/models";
import ApiError from "@/utils/api-error";
import asyncHandler from "@/utils/async-handler";
import { decodeToken } from "@/utils/auth-helper";

export const verifyAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token
      = req.cookies?.access_token
        || req.headers.authorization?.replace("Bearer ", "");

    if (!token)
      throw new ApiError(404, "Invalid access token");
    const decodeJwt = decodeToken(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtResponse;
    const user = await User.findOne({
      where: { id: decodeJwt.id },
      attributes: { exclude: ["password"] },
    });
    if (!user)
      throw new ApiError(404, "User not found in jwt");

    const allowedRoutesForDeleted = ["/account-deleted", "/cancel-deletion"];

    if (user.isDeleteAccount && !allowedRoutesForDeleted.includes(req.path)) {
      throw new ApiError(
        403,
        "Your account is scheduled for deletion. Only limited access is allowed.",
      );
    }

    req.user = user?.toJSON();
    next();
  },
);

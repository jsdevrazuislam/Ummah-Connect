import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { User } from "@/models";
import { Op } from "sequelize";
import {
  compare_password,
  decode_token,
  generate_access_token,
  generate_refresh_token,
  hash_password,
} from "@/utils/auth-helper";
import { sendEmail } from "@/utils/send-email";
import { JwtResponse } from "@/types/auth";

const options = {
  httpOnly: true,
  secure: true,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, full_name, password, username } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (user) throw new ApiError(400, "User already exist");

  const payload = {
    username,
    email,
    password: await hash_password(password),
    full_name,
    role: "user",
    is_verified: false,
  };

  const newUser = await User.create(payload);

  const access_token = generate_access_token({ id: newUser.id, email });

  const verify_url = `${process.env.SERVER_URL}/api/v1/auth/verify-email?token=${access_token}`;
  await sendEmail(
    "We need to verify your email address",
    email,
    full_name,
    { name: full_name, year: new Date().getFullYear(), verify_url },
    9
  );

  return res.json(
    new ApiResponse(200, {}, "Register Successfully. Please verify your email!")
  );
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query?.token as string;

  if (!token) throw new ApiError(400, "Token not found");

  const user_token = decode_token(
    token,
    process.env.ACCESS_TOKEN_SECRET ?? ""
  ) as JwtResponse;

  const user = await User.findOne({ where: { email: user_token.email } });

  if (!user) throw new ApiError(404, "User not found");
  if (user.is_verified) throw new ApiError(400, "User already verified");

  await User.update(
    { is_verified: true },
    {
      where: { email: user_token.email },
    }
  );

  return res.redirect(`${process.env.CLIENT_URL}/login`);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user) throw new ApiError(400, "User doesn't exits");
  const is_password_correct = await compare_password(user.password, password);
  if (!is_password_correct) throw new ApiError(400, "Invalid User Details");

  const access_token = generate_access_token({
    id: user.id,
    email: user.email,
  });
  const refresh_token = generate_refresh_token({
    id: user.id,
    email: user.email,
  });

  await User.update({ refresh_token }, { where: { id: user.id } });

  return res
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", refresh_token, options)
    .json(new ApiResponse(200, {}, "Login Successfully"));
});

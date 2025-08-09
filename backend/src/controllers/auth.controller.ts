import type { Request, Response } from "express";

import qrcode from "qrcode";
import { literal, Op } from "sequelize";
import speakeasy from "speakeasy";

import type { JwtResponse, LocationResponse } from "@/types/auth";
import type { UploadedFiles } from "@/types/global";

import redis from "@/config/redis";
import { POST_ATTRIBUTE, USER_ATTRIBUTE } from "@/constants";
import { Follow, Otp, Post, Reaction, RecoveryCodes, User } from "@/models";
import BookmarkPost from "@/models/bookmark.models";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import {
  comparePassword,
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from "@/utils/auth-helper";
import { removeOldImageOnCloudinary, uploadFileOnCloudinary } from "@/utils/cloudinary";
import { compareRecoveryCode, generateRecoveryCodes, generateSixDigitCode, getOrSetCache } from "@/utils/helper";
import { sendEmail } from "@/utils/send-email";
import { getFollowerCountLiteral, getFollowingCountLiteral, getIsBookmarkedLiteral, getIsFollowingLiteral, getTotalCommentsCountLiteral, getTotalReactionsCountLiteral, getUserReactionLiteral } from "@/utils/sequelize-sub-query";

const options = {
  httpOnly: true,
  secure: true,
};

export async function DELETE_USER_CACHE() {
  await redis.keys("discover:people:*").then((keys) => {
    if (keys.length > 0) {
      redis.del(...keys);
    }
  });
}

export async function DELETE_USER_SUMMARY_CACHE(userId: number) {
  await redis.del(`user:profile:summary:${userId}`);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, fullName, password, username, publicKey, gender = "male", location, latitude, longitude } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (user)
    throw new ApiError(400, "User already exist");

  const payload = {
    username,
    email,
    password: await hashPassword(password),
    fullName,
    role: "user",
    isVerified: false,
    publicKey,
    gender,
    location,
    latitude,
    longitude,
    privacySettings: {
      activeStatus: true,
      privateAccount: false,
      readReceipts: true,
      locationShare: true,
      postSee: "everyone",
      message: "everyone",
    },
  };

  const newUser = await User.create(payload);

  const accessToken = generateAccessToken({ id: newUser.id, email, role: newUser.role });

  const verifiedUrl = `${process.env.SERVER_URL}/api/v1/auth/verify-email?token=${accessToken}`;
  await sendEmail(
    "We need to verify your email address",
    email,
    fullName,
    { name: fullName, year: new Date().getFullYear(), verifiedUrl },
    9,
  );

  await DELETE_USER_CACHE();

  return res.json(
    new ApiResponse(200, {}, "Register Successfully. Please verify your email!"),
  );
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query?.token as string;

  if (!token)
    throw new ApiError(400, "Token not found");

  const userToken = decodeToken(
    token,
    process.env.ACCESS_TOKEN_SECRET ?? "",
  ) as JwtResponse;

  const user = await User.findOne({ where: { email: userToken.email } });

  if (!user)
    throw new ApiError(404, "User not found");
  if (user.isVerified)
    throw new ApiError(400, "User already verified");

  await User.update(
    { isVerified: true },
    {
      where: { email: userToken.email },
    },
  );

  return res.redirect(`${process.env.CLIENT_URL}/login`);
});

export const loginWith2FA = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrUsername, password, token } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user)
    throw new ApiError(400, "User doesn't exist");
  if (!user.isVerified)
    throw new ApiError(400, "Please verified your email");

  const isPasswordCorrect = await comparePassword(user.password, password);
  if (!isPasswordCorrect)
    throw new ApiError(400, "Invalid User Details");

  if (user?.isTwoFactorEnabled) {
    if (!token)
      return res.json(new ApiResponse(200, true, "2FA is required"));

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified)
      throw new ApiError(401, "Invalid 2FA token");
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, status: user?.isDeleteAccount ? "deleted" : "actived" });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role, status: user?.isDeleteAccount ? "deleted" : "actived" });

  await User.update(
    { refreshToken },
    { where: { id: user.id } },
  );

  const safeUser = {
    ...user.get({ plain: true }),
    refreshToken,
  };
  delete safeUser.password;

  const userId = user.id;

  const [followerCount, followingCount, totalPosts, totalLikes, totalBookmarks] = await Promise.all([
    Follow.count({ where: { followerId: userId } }),
    Follow.count({ where: { followingId: userId } }),
    Post.count({ where: { authorId: userId } }),
    Reaction.count({
      include: [{
        model: Post,
        as: "post",
        where: { authorId: userId },
        attributes: [],
      }],
    }),
    BookmarkPost.count({ where: { userId } }),
  ]);

  await DELETE_USER_SUMMARY_CACHE(userId);

  return res
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            ...safeUser,
            followingCount: followerCount,
            followersCount: followingCount,
            totalPosts,
            totalLikes,
            totalBookmarks,
          },
          accessToken,
          refreshToken,
        },
        "Login Successfully",
      ),
    );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  return res
    .clearCookie("access_token")
    .clearCookie("refresh_token")
    .json(new ApiResponse(200, null, "Logout Success"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const cacheKey = `user:profile:summary:${userId}`;

  const responseData = await getOrSetCache(
    cacheKey,
    async () => {
      const followerCount = await Follow.count({ where: { followerId: userId } });
      const followingCount = await Follow.count({ where: { followingId: userId } });
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ["password", "twoFactorSecret"],
        },
      });

      if (!user)
        throw new ApiError(404, "Not found user");

      const totalPosts = await Post.count({
        where: { authorId: userId },
      });

      const totalLikes = await Reaction.count({
        include: [
          {
            model: Post,
            as: "post",
            where: { authorId: userId },
            attributes: [],
          },
        ],
      });

      const totalBookmarks = await BookmarkPost.count({
        where: { userId },
      });

      const responseData = {
        user: {
          ...user.toJSON(),
          followingCount: followerCount,
          followersCount: followingCount,
          totalPosts,
          totalLikes,
          totalBookmarks,
        },
      };

      return responseData;
    },
    60 * 60 * 24,
  );

  return res.json(
    new ApiResponse(200, responseData, "Fetching User Success"),
  );
});

export const updateCurrentUserInfo = asyncHandler(async (req: Request, res: Response) => {
  const { website, fullName, location, email, bio, username, gender } = req.body;
  const files = req.files as UploadedFiles | undefined;
  const coverPath = files?.cover?.[0].path;
  const avatarPath = files?.avatar?.[0].path;

  const user = await User.findOne({ where: { id: req.user.id } });

  if (avatarPath && user?.avatar) {
    await removeOldImageOnCloudinary(user?.avatar);
  }
  if (coverPath && user?.cover) {
    await removeOldImageOnCloudinary(user?.cover);
  }

  let avatarUrl = null;
  let coverUrl = null;
  if (avatarPath) {
    const media = await uploadFileOnCloudinary(
      avatarPath,
      "ummah_connect/profiles_pictures",
    );
    avatarUrl = media?.url;
  }
  if (coverPath) {
    const media = await uploadFileOnCloudinary(
      coverPath,
      "ummah_connect/cover_photos",
    );
    coverUrl = media?.url;
  }

  const payload = {
    website,
    fullName,
    location,
    ...(avatarUrl && { avatar: avatarUrl }),
    email,
    bio,
    username,
    gender,
    ...(coverUrl && { cover: coverUrl }),
  };

  const updateUser = await User.update(
    { ...payload },
    {
      where: { id: req.user.id },
      returning: true,
    },
  );

  const safeUser = updateUser[1][0].get({ plain: true });
  delete safeUser.password;

  await DELETE_USER_CACHE();
  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res.json(
    new ApiResponse(200, safeUser, "Update Profile Success"),
  );
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({
    where: { username: req.params.username },
    attributes: {
      exclude: ["password", "refreshToken", "role"],
    },
  });

  if (!user)
    throw new ApiError(404, "User not found");

  const followerCount = await Follow.count({ where: { followingId: user.id } });
  const followingCount = await Follow.count({ where: { followerId: user.id } });
  const isFollow = await Follow.findOne({ where: { followingId: user.id, followerId: req.user.id } });

  return res.json(
    new ApiResponse(200, {
      user: {
        ...user.toJSON(),
        followingCount: followerCount,
        followersCount: followingCount,
        isFollowing: !!isFollow,
      },
    }, "Fetch success"),
  );
});

export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const currentUserId = req.user.id;

  const user = await User.findOne({
    where: { username: req.params.username },
  });

  if (!user)
    throw new ApiError(404, "User not found");

  const { count, rows: posts } = await Post.findAndCountAll({
    limit,
    offset: skip,
    where: { authorId: user.id, privacy: "public" },
    include: [
      {
        model: Post,
        as: "originalPost",
        attributes: POST_ATTRIBUTE,
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              ...USER_ATTRIBUTE,
              getFollowerCountLiteral("\"originalPost->user\".\"id\""),
              getFollowingCountLiteral("\"originalPost->user\".\"id\""),
              getIsFollowingLiteral(
                currentUserId,
                "\"originalPost->user\".\"id\"",
              ),
            ],
          },
        ],
      },
      {
        model: User,
        required: false,
        attributes: USER_ATTRIBUTE,
        as: "user",
      },
    ],
    attributes: {
      include: [
        getTotalCommentsCountLiteral("\"Post\""),
        getTotalReactionsCountLiteral("\"Post\""),
        getIsBookmarkedLiteral(currentUserId, "\"Post\""),
        getUserReactionLiteral(currentUserId, "\"Post\""),
        getIsFollowingLiteral(currentUserId, "\"Post\".\"authorId\""),
      ],
    },
  });

  return res.json(
    new ApiResponse(200, {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    }, "Post Success"),
  );
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (oldPassword === newPassword)
    throw new ApiError(400, "Old password and new password is same");

  const hashPass = await hashPassword(newPassword);

  await User.update(
    { password: hashPass },
    { where: { id: req.user.id } },
  );

  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res.json(
    new ApiResponse(200, null, "Password Change Successfully"),
  );
});

export const updatePrivacySettings = asyncHandler(async (req: Request, res: Response) => {
  const { activeStatus, privateAccount, readReceipts, locationShare, postSee, message } = req.body;

  const [, updateData] = await User.update(
    {
      privacySettings: {
        activeStatus,
        privateAccount,
        readReceipts,
        locationShare,
        postSee,
        message,
      },
    },
    {
      where: { id: req.user.id },
      returning: true,
    },
  );

  await DELETE_USER_CACHE();
  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res.json(
    new ApiResponse(200, updateData[0], "Update Settings"),
  );
});

export const updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
  const { pushNotification, emailNotification, prayerTimeNotification, likePost, commentPost, mention, newFollower, dm, islamicEvent } = req.body;

  const [, updateData] = await User.update(
    {
      notificationPreferences: {
        pushNotification,
        emailNotification,
        prayerTimeNotification,
        likePost,
        commentPost,
        mention,
        newFollower,
        dm,
        islamicEvent,
      },
    },
    {
      where: { id: req.user.id },
      returning: true,
    },
  );

  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res.json(
    new ApiResponse(200, updateData[0], "Update Settings"),
  );
});

export const enable2FA = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const secret = speakeasy.generateSecret({
    name: `Ummah Connect - ${user?.email}`,
    length: 20,
  });

  await User.update(
    { twoFactorSecret: secret.base32 },
    { where: { id: req.user.id } },
  );

  const qrDataURL = await qrcode.toDataURL(secret.otpauth_url ?? "");

  return res.json(
    new ApiResponse(200, {
      qrCode: qrDataURL,
      secret: secret.base32,
    }, "Scan the QR code in Google Authenticator"),
  );
});

export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const verified = speakeasy.totp.verify({
    secret: user?.twoFactorSecret ?? "",
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    throw new ApiError(400, "Invalid or expired 2FA code");
  }

  const { plainCodes, hashedCodes } = await generateRecoveryCodes();

  await RecoveryCodes.destroy({ where: { userId, used: false } });

  const recoveryCodes = hashedCodes?.map(hash => ({
    userId,
    codeHash: hash,
    used: false,
  }));

  await RecoveryCodes.bulkCreate(recoveryCodes);

  await User.update(
    { isTwoFactorEnabled: true },
    { where: { id: userId } },
  );

  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res.json(
    new ApiResponse(200, plainCodes, "2FA verified and enabled successfully"),
  );
});

export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  await User.update(
    { isTwoFactorEnabled: false, twoFactorSecret: null },
    { where: { id: req.user.id } },
  );
  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res.json(new ApiResponse(200, null, "2FA disabled successfully"));
});

export const recover2FA = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrUsername, recoveryCode } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
    include: [{
      model: RecoveryCodes,
      as: "recoveryCodes",
      where: { used: false },
      required: false,
    }],
  });

  if (!user)
    throw new ApiError(404, "User not found");

  let matchCode = null;

  for (const rc of user.recoveryCodes) {
    const isMatch = await compareRecoveryCode(recoveryCode, rc.codeHash);
    if (isMatch) {
      matchCode = rc;
      break;
    }
  }

  if (!matchCode)
    throw new ApiError(401, "Invalid recovery code or already used");

  await matchCode.update(
    { used: true },
    { where: { userId: user.id } },
  );

  await RecoveryCodes.destroy(
    { where: { userId: user.id, used: false } },
  );

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user?.isDeleteAccount ? "deleted" : "actived",
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user?.isDeleteAccount ? "deleted" : "actived",
  });

  const updatedUser = await User.update(
    { refreshToken, isTwoFactorEnabled: false, twoFactorSecret: null },
    {
      where: { email: user.email },
      returning: true,
    },
  );

  const safeUser = updatedUser[1][0].get({ plain: true });
  delete safeUser.password;

  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken,
          refreshToken,
        },
        "Login Successfully",
      ),
    );
});

export const requestEmailOtp = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user)
    throw new ApiError(404, "User not found");

  const lastOtp = await Otp.findOne({
    where: {
      userId: user.id,
    },
    order: [["createdAt", "DESC"]],
  });

  const COOLDOWN_PERIOD_MS = 10 * 60 * 1000;

  if (lastOtp) {
    const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();

    if (timeSinceLastOtp < COOLDOWN_PERIOD_MS) {
      const remainingTimeMs = COOLDOWN_PERIOD_MS - timeSinceLastOtp;
      const remainingMinutes = Math.ceil(remainingTimeMs / (60 * 1000));
      throw new ApiError(
        429,
        `Please wait ${remainingMinutes} minute(s) before requesting another OTP.`,
      );
    }
  }

  const otp = generateSixDigitCode();
  const expires = Date.now() + 10 * 60 * 1000;

  await Otp.create({
    userId: user.id,
    otp,
    otpExpire: expires,
  });

  await sendEmail(
    `2FA Otp Request - ${otp}`,
    user.email,
    user.fullName,
    { name: user.fullName, YEAR: new Date().getFullYear(), CODE: otp },
    10,
  );

  return res.json(
    new ApiResponse(200, null, "OTP sent to your email"),
  );
});

export const verify2FAOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otpCode } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user)
    throw new ApiError(404, "User not found");

  const userOtp = await Otp.findOne({ where: { userId: user.id } });

  if (userOtp?.otp !== Number(otpCode) || Date.now() > new Date(userOtp?.otpExpire ?? "").getTime())
    throw new ApiError(401, "Invalid or expired otp");

  await Otp.destroy({
    where: {
      userId: user.id,
    },
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user?.isDeleteAccount ? "deleted" : "actived",
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user?.isDeleteAccount ? "deleted" : "actived",
  });

  const updatedUser = await User.update(
    { refreshToken },
    {
      where: { email: user.email },
      returning: true,
    },
  );

  const safeUser = updatedUser[1][0].get({ plain: true });
  delete safeUser.password;

  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  return res
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken,
          refreshToken,
        },
        "Login Successfully",
      ),
    );
});

export const getPlaceName = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  const mapboxRes = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.MAPBOX_TOKEN}&types=place`,
  );
  const data: LocationResponse = await mapboxRes.json();

  const city = data.features?.[0]?.text || "";
  const country = data.features?.[0]?.context?.find(c => c.id.includes("country"))?.text || "";

  return res.json(
    new ApiResponse(200, `${city}, ${country}`),
  );
});

export const discoverPeople = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { search, location, title, interests } = req.query;

  const cacheKey = `discover:people:${page}:${limit}:${search || ""}:${location || ""}:${title || ""}:${interests || ""}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "Cache Response"));
  }

  const where: any = {};

  if (search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { username: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (location) {
    where.location = { [Op.iLike]: `%${location}%` };
  }

  if (title) {
    where.title = { [Op.iLike]: `%${title}%` };
  }

  if (interests) {
    const interestsArray = (interests as string).split(",").map(i => i.trim());
    where.interests = {
      [Op.overlap]: interestsArray,
    };
  }

  where.isDeleteAccount = false;

  const { rows: users, count: total } = await User.findAndCountAll({
    where,
    limit,
    offset,
    attributes: [
      "id",
      "username",
      "fullName",
      "avatar",
      "location",
      "title",
      "interests",
      "cover",
      "bio",
      "dob",
      "verifiedIdentity",
      [literal(`(SELECT COUNT(*) FROM "follows" WHERE "follows"."followingId" = "User"."id")`), "followersCount"],
      [literal(`(SELECT COUNT(*) FROM "follows" WHERE "follows"."followerId" = "User"."id")`), "followingCount"],
      [literal(`(SELECT COUNT(*) FROM "posts" WHERE "posts"."authorId" = "User"."id")`), "postsCount"],
      [literal(`EXISTS (
      SELECT 1 FROM "follows"
      WHERE "follows"."followerId" = ${req.user.id}
      AND "follows"."followingId" = "User"."id"
    )`), "isFollowing"],
    ],
    order: [["createdAt", "DESC"]],
  });

  const result = {
    page,
    totalPages: Math.ceil(total / limit),
    total,
    users,
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 600);

  return res.json(new ApiResponse(200, result, "Users fetched"));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  await User.update(
    {
      isDeleteAccount: true,
      deletedAt: new Date(),
    },
    { where: { id: userId } },
  );

  await sendEmail(
    "Account Deleted",
    req.user.email,
    req.user.fullName,
    { name: req.user.fullName, year: new Date().getFullYear(), url: process.env.CLIENT_URL },
    13,
  );

  await DELETE_USER_CACHE();
  await DELETE_USER_SUMMARY_CACHE(req.user.id);

  const accessToken = generateAccessToken({ id: req.user.id, email: req.user.email, role: req.user.role, status: "deleted" });

  return res.status(200).json(
    new ApiResponse(200, accessToken, "Account deletion scheduled successfully"),
  );
});

export const cancelAccountDeletion = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const user = await User.findOne({ where: { id: userId } });

  if (!user)
    throw new ApiError(404, "User not found");

  if (!user.isDeleteAccount)
    throw new ApiError(400, "Your account is not scheduled for deletion");

  user.isDeleteAccount = false;
  user.deletedAt = null;
  await user.save();

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, status: user?.isDeleteAccount ? "deleted" : "actived" });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role, status: user?.isDeleteAccount ? "deleted" : "actived" });

  user.refreshToken = refreshToken;

  await user.save();

  const [followerCount, followingCount, totalPosts, totalLikes, totalBookmarks] = await Promise.all([
    Follow.count({ where: { followerId: userId } }),
    Follow.count({ where: { followingId: userId } }),
    Post.count({ where: { authorId: userId } }),
    Reaction.count({
      include: [{
        model: Post,
        as: "post",
        where: { authorId: userId },
        attributes: [],
      }],
    }),
    BookmarkPost.count({ where: { userId } }),
  ]);

  await DELETE_USER_SUMMARY_CACHE(userId);

  return res
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            ...user.toJSON(),
            followingCount: followerCount,
            followersCount: followingCount,
            totalPosts,
            totalLikes,
            totalBookmarks,
          },
          accessToken,
          refreshToken,
        },
        "Login Successfully",
      ),
    );
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!incomingRefreshToken)
    throw new ApiError(401, "Refresh Token Invalid. Please try again with login");
  const decodedToken = decodeToken(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET ?? "",
  ) as JwtResponse;
  const user = await User.findByPk(decodedToken?.id);
  if (!user)
    throw new ApiError(401, "User Not Found");

  if (incomingRefreshToken !== user?.refreshToken)
    throw new ApiError(401, "Invalid Refresh Token.");

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, status: user?.isDeleteAccount ? "deleted" : "actived" });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role, status: user?.isDeleteAccount ? "deleted" : "actived" });

  user.refreshToken = refreshToken;
  await user.save();

  const userId = user.id;

  const [followerCount, followingCount, totalPosts, totalLikes, totalBookmarks] = await Promise.all([
    Follow.count({ where: { followerId: userId } }),
    Follow.count({ where: { followingId: userId } }),
    Post.count({ where: { authorId: userId } }),
    Reaction.count({
      include: [{
        model: Post,
        as: "post",
        where: { authorId: userId },
        attributes: [],
      }],
    }),
    BookmarkPost.count({ where: { userId } }),
  ]);

  await DELETE_USER_SUMMARY_CACHE(userId);

  return res
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            ...user.toJSON(),
            followingCount: followerCount,
            followersCount: followingCount,
            totalPosts,
            totalLikes,
            totalBookmarks,
          },
          accessToken,
          refreshToken,
        },
        "Login Successfully",
      ),
    );
});

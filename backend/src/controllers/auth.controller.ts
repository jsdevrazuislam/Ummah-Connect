import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Follow, Post, Reaction, User } from "@/models";
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
import uploadFileOnCloudinary, { removeOldImageOnCloudinary } from "@/utils/cloudinary";
import sequelize from "@/config/db";
import BookmarkPost from "@/models/bookmark.models";
import { formatPosts } from "@/utils/formater";
import { UploadedFiles } from "@/types/global";

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

  const access_token = generate_access_token({ id: newUser.id, email, role: newUser.role });

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
    role: user.role
  });
  const refresh_token = generate_refresh_token({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const updated_user = await User.update(
    { refresh_token },
    {
      where: { email: user.email },
      returning: true,
    }
  );

  const safeUser = updated_user[1][0].get({ plain: true });
  delete safeUser.password;

  return res
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", refresh_token, options)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          access_token,
          refresh_token,
        },
        "Login Successfully"
      )
    );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  return res
    .clearCookie("access_token")
    .clearCookie("refresh_token")
    .json(new ApiResponse(200, null, "Logout Success"));
});

export const get_me = asyncHandler(async (req: Request, res: Response) => {
  const followerCount = await Follow.count({ where: { followingId: req.user.id } });
  const followingCount = await Follow.count({ where: { followerId: req.user.id } });
  return res.json(
    new ApiResponse(200, {
      user: {
        ...req.user,
        following_count: followerCount,
        followers_count: followingCount
      }
    }, "Fetching User Success")
  );
});

export const update_current_user_info = asyncHandler(async (req: Request, res: Response) => {

  const { website, full_name, location, email, bio, username, gender } = req.body
  const files = req.files as UploadedFiles | undefined;
  const coverPath = files?.cover?.[0].path;
  const avatarPath = files?.avatar?.[0].path

  const user = await User.findOne({ where: { id: req.user.id } })

  if (avatarPath && user?.avatar) {
    await removeOldImageOnCloudinary(user?.avatar);
  }
  if (coverPath && user?.cover) {
    await removeOldImageOnCloudinary(user?.cover);
  }

  let avatar_url = null;
  let cover_url = null;
  if (avatarPath) {
    const media = await uploadFileOnCloudinary(
      avatarPath,
      "ummah_connect/profiles_pictures"
    );
    avatar_url = media;
  }
  if (coverPath) {
    const media = await uploadFileOnCloudinary(
      coverPath,
      "ummah_connect/cover_photos"
    );
    cover_url = media;
  }

  const payload = {
    website,
    full_name,
    location,
    avatar: avatar_url,
    email,
    bio,
    username,
    gender,
    cover: cover_url
  };


  const updateUser = await User.update(
    { ...payload },
    {
      where: { id: req.user.id },
      returning: true
    }
  )

  const safeUser = updateUser[1][0].get({ plain: true });
  delete safeUser.password;

  return res.json(
    new ApiResponse(200, safeUser, 'Update Profile Success')
  )
})

export const get_user_profile = asyncHandler(async (req: Request, res: Response) => {

  const user = await User.findOne({
    where: { username: req.params.username },
    attributes: {
      exclude: ['password', 'refresh_token', 'role']
    }
  })

  if (!user) throw new ApiError(404, 'User not found')

  const followerCount = await Follow.count({ where: { followingId: user.id } });
  const followingCount = await Follow.count({ where: { followerId: user.id } });


  return res.json(
    new ApiResponse(200, {
      ...user.toJSON(),
      following_count: followerCount,
      followers_count: followingCount
    }, 'Fetch success')
  )
})

export const get_user_details = asyncHandler(async (req: Request, res: Response) => {

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const currentUserId = req.user?.id;

  const user = await User.findOne({
    where: { username: req.params.username },
  })

  if (!user) throw new ApiError(404, 'User not found')

  const user_attribute = ['id', 'username', 'full_name', 'avatar']
  const react_attribute = ['userId', 'react_type', 'icon', 'commentId', 'postId']

  const { count, rows: posts } = await Post.findAndCountAll({
    limit: limit,
    offset: skip,
    where: { authorId: user.id },
    include: [
      {
        model: Post,
        as: 'originalPost',
        attributes: ['id', 'media', 'content', 'location', 'privacy', 'createdAt'],
        include: [
          { model: User, as: 'user', attributes: user_attribute },
        ]
      },
      {
        model: Reaction,
        required: false,
        attributes: react_attribute,
        as: 'reactions'
      },
      { model: BookmarkPost, attributes: ['id', 'postId', 'userId'], as: 'bookmarks' },
      {
        model: User,
        required: false,
        attributes: user_attribute,
        as: 'user'
      }
    ],
    attributes: {
      include: [
        [
          sequelize.literal(`(
          SELECT COUNT(*) FROM "comments" AS c
          WHERE c."postId" = "Post"."id"
        )`),
          'totalCommentsCount'
        ],
        [
          sequelize.literal(`(
          SELECT COUNT(*) FROM "reactions" AS r
          WHERE r."postId" = "Post"."id"
        )`),
          'totalReactionsCount'
        ],
      ],
    }
  });

  const formatPostData = formatPosts(posts, currentUserId)


  return res.json(
    new ApiResponse(200, {
      posts: formatPostData,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }, 'Post Success')
  )
})
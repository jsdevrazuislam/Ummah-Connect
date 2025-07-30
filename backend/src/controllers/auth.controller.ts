import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Follow, Otp, Post, Reaction, RecoveryCodes, User } from "@/models";
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
import { removeOldImageOnCloudinary, uploadFileOnCloudinary } from "@/utils/cloudinary";
import { UploadedFiles } from "@/types/global";
import { POST_ATTRIBUTE, USER_ATTRIBUTE } from "@/constants";
import { getFollowerCountLiteral, getFollowingCountLiteral, getIsBookmarkedLiteral, getIsFollowingLiteral, getTotalCommentsCountLiteral, getTotalReactionsCountLiteral, getUserReactionLiteral } from "@/utils/sequelize-sub-query";
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { compareRecoveryCode, generateRecoveryCodes, generateSixDigitCode } from "@/utils/helper";
import BookmarkPost from "@/models/bookmark.models";


const options = {
  httpOnly: true,
  secure: true,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, full_name, password, username, public_key, gender = 'male', location, latitude, longitude } = req.body;

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
    public_key,
    gender,
    location,
    latitude, 
    longitude,
    privacy_settings: {
      active_status: true,
      private_account: false,
      read_receipts: true,
      location_share: true,
      post_see: 'everyone',
      message: 'everyone'
    }
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

export const verify_email = asyncHandler(async (req: Request, res: Response) => {
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


export const login_with_2FA = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrUsername, password, token } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user) throw new ApiError(400, "User doesn't exist");
  if (!user.is_verified) throw new ApiError(400, "Please verified your email");

  const is_password_correct = await compare_password(user.password, password);
  if (!is_password_correct) throw new ApiError(400, "Invalid User Details");

  if (user?.is_two_factor_enabled) {
    if (!token) return res.json(new ApiResponse(200, true, '2FA is required'));

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) throw new ApiError(401, "Invalid 2FA token");
  }

  const access_token = generate_access_token({ id: user.id, email: user.email, role: user.role });
  const refresh_token = generate_refresh_token({ id: user.id, email: user.email, role: user.role });

  await User.update(
    { refresh_token },
    { where: { id: user.id } }
  );

  const safeUser = {
    ...user.get({ plain: true }),
    refresh_token
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
    BookmarkPost.count({ where: { userId } })
  ]);

  return res
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", refresh_token, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            ...safeUser,
            following_count: followerCount,
            followers_count: followingCount,
            totalPosts,
            totalLikes,
            totalBookmarks,
          },
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

  const userId = req.user.id

  const followerCount = await Follow.count({ where: { followerId: userId } });
  const followingCount = await Follow.count({ where: { followingId: userId } });
  const user = await User.findOne({
    where: { id: req.user.id }, attributes: {
      exclude: ['password', 'two_factor_secret']
    }
  })

  if (!user) throw new ApiError(404, 'Not found user')


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

  return res.json(
    new ApiResponse(200, {
      user: {
        ...user?.toJSON(),
        following_count: followerCount,
        followers_count: followingCount,
        totalPosts,
        totalLikes,
        totalBookmarks,
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
    avatar_url = media?.url;
  }
  if (coverPath) {
    const media = await uploadFileOnCloudinary(
      coverPath,
      "ummah_connect/cover_photos"
    );
    cover_url = media?.url;
  }

  const payload = {
    website,
    full_name,
    location,
    ...(avatar_url && { avatar: avatar_url }),
    email,
    bio,
    username,
    gender,
    ...(cover_url && { cover: cover_url })
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
  const isFollow = await Follow.findOne({ where: { followingId: user.id, followerId: req.user.id } });


  return res.json(
    new ApiResponse(200, {
        user: {
          ...user.toJSON(),
          following_count: followerCount,
          followers_count: followingCount,
          isFollowing: isFollow ? true : false 
        }
    }, 'Fetch success')
  )
})

export const get_user_details = asyncHandler(async (req: Request, res: Response) => {

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const currentUserId = req.user.id

  const user = await User.findOne({
    where: { username: req.params.username },
  })

  if (!user) throw new ApiError(404, 'User not found')


  const { count, rows: posts } = await Post.findAndCountAll({
    limit: limit,
    offset: skip,
    where: { authorId: user.id, privacy: 'public' },
    include: [
      {
        model: Post,
        as: 'originalPost',
        attributes: POST_ATTRIBUTE,
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              ...USER_ATTRIBUTE,
              getFollowerCountLiteral('"originalPost->user"."id"'),
              getFollowingCountLiteral('"originalPost->user"."id"'),
              getIsFollowingLiteral(
                currentUserId,
                '"originalPost->user"."id"'
              ),
            ],
          },
        ]
      },
      {
        model: User,
        required: false,
        attributes: USER_ATTRIBUTE,
        as: 'user'
      }
    ],
    attributes: {
      include: [
        getTotalCommentsCountLiteral('"Post"'),
        getTotalReactionsCountLiteral('"Post"'),
        getIsBookmarkedLiteral(currentUserId, '"Post"'),
        getUserReactionLiteral(currentUserId, '"Post"'),
        getIsFollowingLiteral(currentUserId, '"Post"."authorId"'),
      ],
    }
  });


  return res.json(
    new ApiResponse(200, {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }, 'Post Success')
  )
})

export const change_password = asyncHandler(async (req: Request, res: Response) => {

  const { oldPassword, newPassword } = req.body

  if (oldPassword === newPassword) throw new ApiError(400, 'Old password and new password is same')

  const hashPassword = await hash_password(newPassword)

  await User.update(
    { password: hashPassword },
    { where: { id: req.user.id } }
  )

  return res.json(
    new ApiResponse(200, null, 'Password Change Successfully')
  )
})

export const update_privacy_settings = asyncHandler(async (req: Request, res: Response) => {

  const { active_status, private_account, read_receipts, location_share, post_see, message } = req.body

  const [, updateData] = await User.update(
    {
      privacy_settings: {
        active_status,
        private_account,
        read_receipts,
        location_share,
        post_see,
        message
      }
    },
    {
      where: { id: req.user.id },
      returning: true
    }
  )


  return res.json(
    new ApiResponse(200, updateData[0], 'Update Settings')
  )

})

export const update_notification_preferences = asyncHandler(async (req: Request, res: Response) => {

  const { push_notification, email_notification, prayer_time_notification, like_post, comment_post, mention, new_follower, dm, islamic_event } = req.body

  const [, updateData] = await User.update(
    {
      notification_preferences: {
        push_notification,
        email_notification,
        prayer_time_notification,
        like_post,
        comment_post,
        mention,
        new_follower,
        dm,
        islamic_event
      }
    },
    {
      where: { id: req.user.id },
      returning: true
    }
  )


  return res.json(
    new ApiResponse(200, updateData[0], 'Update Settings')
  )

})

export const enable_2FA = asyncHandler(async (req: Request, res: Response) => {

  const user = req.user;
  const secret = speakeasy.generateSecret({
    name: `Ummah Connect - ${user?.email}`,
    length: 20
  })

  await User.update(
    { two_factor_secret: secret.base32 },
    { where: { id: req.user.id } }
  )

  const qrDataURL = await qrcode.toDataURL(secret.otpauth_url ?? '');


  return res.json(
    new ApiResponse(200, {
      qrCode: qrDataURL,
      secret: secret.base32
    }, 'Scan the QR code in Google Authenticator')
  )
})

export const verify_2FA = asyncHandler(async (req: Request, res: Response) => {

  const { token } = req.body
  const user_id = req.user.id
  const user = await User.findOne({ where: { id: user_id } })
  const verified = speakeasy.totp.verify({
    secret: user?.two_factor_secret ?? '',
    encoding: 'base32',
    token,
    window: 1
  });

  if (!verified) {
    throw new ApiError(400, "Invalid or expired 2FA code");
  }

  const { plainCodes, hashedCodes } = await generateRecoveryCodes();

  await RecoveryCodes.destroy({ where: { user_id: user_id, used: false } });

  const recovery_codes = hashedCodes?.map((hash) => ({
    user_id,
    code_hash: hash,
    used: false
  }))

  await RecoveryCodes.bulkCreate(recovery_codes)

  await User.update(
    { is_two_factor_enabled: true },
    { where: { id: user_id } }
  )

  return res.json(
    new ApiResponse(200, plainCodes, "2FA verified and enabled successfully")
  )
})

export const disable_2FA = asyncHandler(async (req: Request, res: Response) => {

  await User.update(
    { is_two_factor_enabled: false, two_factor_secret: null },
    { where: { id: req.user.id } }
  )
  return res.json(new ApiResponse(200, null, "2FA disabled successfully"));
})

export const recover_2FA = asyncHandler(async (req: Request, res: Response) => {

  const { emailOrUsername, recoveryCode } = req.body

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }]
    },
    include: [{
      model: RecoveryCodes,
      as: 'recoveryCodes',
      where: { used: false },
      required: false
    }]
  })

  if (!user) throw new ApiError(404, 'User not found')

  let matchCode = null

  for (const rc of user.recoveryCodes) {
    const isMatch = await compareRecoveryCode(recoveryCode, rc.code_hash)
    if (isMatch) {
      matchCode = rc
      break
    }
  }

  if (!matchCode) throw new ApiError(401, 'Invalid recovery code or already used')

  await matchCode.update(
    { used: true },
    { where: { user_id: user.id } }
  )

  await RecoveryCodes.destroy(
    { where: { user_id: user.id, used: false } }
  )

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
    { refresh_token, is_two_factor_enabled: false, two_factor_secret: null },
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
})

export const request_email_otp = asyncHandler(async (req: Request, res: Response) => {

  const user = await User.findOne({ where: { email: req.body.email } })
  if (!user) throw new ApiError(404, 'User not found')

  const lastOtp = await Otp.findOne({
    where: {
      user_id: user.id,
    },
    order: [['createdAt', 'DESC']],
  });

  const COOLDOWN_PERIOD_MS = 10 * 60 * 1000;

  if (lastOtp) {
    const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();

    if (timeSinceLastOtp < COOLDOWN_PERIOD_MS) {
      const remainingTimeMs = COOLDOWN_PERIOD_MS - timeSinceLastOtp;
      const remainingMinutes = Math.ceil(remainingTimeMs / (60 * 1000));
      throw new ApiError(
        429,
        `Please wait ${remainingMinutes} minute(s) before requesting another OTP.`
      );
    }
  }

  const otp = generateSixDigitCode()
  const expires = Date.now() + 10 * 60 * 1000;

  await Otp.create({
    user_id: user.id,
    otp,
    otp_expire: expires
  })

  await sendEmail(
    `2FA Otp Request - ${otp}`,
    user.email,
    user.full_name,
    { name: user.full_name, YEAR: new Date().getFullYear(), CODE: otp },
    10
  );

  return res.json(
    new ApiResponse(200, null, 'OTP sent to your email')
  )
})

export const verify_2FA_otp = asyncHandler(async (req: Request, res: Response) => {

  const { email, otpCode } = req.body

  const user = await User.findOne({ where: { email } })
  if (!user) throw new ApiError(404, 'User not found')


  const userOtp = await Otp.findOne({ where: { user_id: user.id } })

  if (userOtp?.otp !== Number(otpCode) || Date.now() > new Date(userOtp?.otp_expire ?? '').getTime()) throw new ApiError(401, 'Invalid or expired otp')

  await Otp.destroy({
    where: {
      user_id: user.id
    }
  })

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
})

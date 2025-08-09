import type { Request, Response } from "express";

import { literal, Op } from "sequelize";

import sequelize from "@/config/db";
import redis from "@/config/redis";
import { POST_ATTRIBUTE, USER_ATTRIBUTE } from "@/constants";
import { DELETE_USER_SUMMARY_CACHE } from "@/controllers/auth.controller";
import { NOTIFICATION_CACHE } from "@/controllers/notification.controller";
import { Follow, Notification, Post, Reaction, User } from "@/models";
import BookmarkPost from "@/models/bookmark.models";
import { NotificationType } from "@/models/notification.models";
import { postSchema } from "@/schemas/post.schema";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import {
  removeOldImageOnCloudinary,
  uploadFileOnCloudinary,
} from "@/utils/cloudinary";
import { getFileTypeFromPath } from "@/utils/file-format";
import { getOrSetCache } from "@/utils/helper";
import { createAndInvalidateNotification } from "@/utils/notification";
import {
  getFollowerCountLiteral,
  getFollowingCountLiteral,
  getIsBookmarkedLiteral,
  getIsFollowingLiteral,
  getTotalCommentsCountLiteral,
  getTotalReactionsCountLiteral,
  getUserReactionLiteral,
} from "@/utils/sequelize-sub-query";

export async function DELETE_POST_CACHE() {
  await redis.keys("posts:public:*").then((keys) => {
    if (keys.length > 0) {
      redis.del(...keys);
    }
  });
}

export async function INVALID_POST_CACHE(userId: number) {
  const keys = await redis.keys(`user:${userId}:posts:*`);
  if (keys.length)
    await redis.del(...keys);
}

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const data = postSchema.parse(req.body);
  const { content, location, privacy, background } = data;
  const authorId = req.user.id;
  const mediaPath = req.file?.path;
  let mediaUrl = null;
  let contentType: "text" | "video" | "audio" | "picture" = "text";

  if (mediaPath) {
    const uploaded = await uploadFileOnCloudinary(mediaPath, "ummah_connect/posts");
    mediaUrl = uploaded?.url;

    const mimeType = uploaded?.resource_type || getFileTypeFromPath(mediaPath);
    if (mimeType?.startsWith("video"))
      contentType = "video";
    else if (mimeType?.startsWith("audio"))
      contentType = "audio";
    else if (mimeType?.startsWith("image"))
      contentType = "picture";
    else contentType = "text";
  }

  const payload = {
    content,
    location,
    privacy,
    media: mediaUrl,
    authorId,
    background,
    contentType,
  };

  const newPost = await Post.create(payload);
  const followerCount = await Follow.count({
    where: { followingId: req.user.id },
  });
  const followingCount = await Follow.count({
    where: { followerId: req.user.id },
  });

  const postData = {
    ...newPost.toJSON(),
    user: {
      id: authorId,
      fullName: req.user?.fullName,
      avatar: req.user?.avatar,
      username: req?.user?.username,
      location: req.user?.location,
      bio: req.user?.bio,
      followersCount: followerCount,
      followingCount,
      isFollowing: false,
    },
    replies: [],
    isBookmarked: false,
    totalReactionsCount: 0,
    share: 0,
    totalCommentsCount: 0,
    currentUserReaction: null,
  };

  await DELETE_USER_SUMMARY_CACHE(req.user.id);
  await DELETE_POST_CACHE();
  await INVALID_POST_CACHE(req.user.id);

  return res.json(new ApiResponse(200, postData, "Post Created Successfully"));
});

export const postReact = asyncHandler(async (req: Request, res: Response) => {
  const { reactType, icon } = req.body;
  const postId = Number(req.params?.postId);
  const userId = req.user?.id;

  const existingReaction = await Reaction.findOne({ where: { userId, postId } });

  if (existingReaction) {
    if (!reactType && !icon) {
      await existingReaction.destroy();
    }
    else {
      await existingReaction.update({
        reactType: reactType || null,
        icon: icon || null,
      });
    }
  }
  else {
    await Reaction.create({ userId, postId, reactType, icon });
  }

  const postWithStats = await Post.findOne({
    where: { id: postId },
    attributes: {
      include: [
        getTotalReactionsCountLiteral("\"Post\""),
        getUserReactionLiteral(userId, "\"Post\""),
        "authorId",
      ],
    },
  });

  if (!postWithStats)
    throw new ApiError(404, "Post not found");
  const receiverId = Number(postWithStats.authorId);

  if (userId !== receiverId) {
    const receiver = await User.findByPk(receiverId, {
      attributes: ["id", "notificationPreferences"],
    });

    if (receiver?.notificationPreferences?.likePost) {
      let notification = await Notification.findOne({
        where: { senderId: userId, receiverId, postId, type: NotificationType.LIKE },
      });

      if (notification) {
        await notification.update({
          icon,
          isRead: false,
          updatedAt: new Date(),
        });
      }
      else {
        notification = await Notification.create({
          senderId: userId,
          receiverId,
          type: NotificationType.LIKE,
          icon,
          postId,
        });
      }

      emitSocketEvent({
        req,
        roomId: `user:${receiverId}`,
        event: SocketEventEnum.NOTIFY_USER,
        payload: {
          ...notification.toJSON(),
          sender: {
            avatar: req.user?.avatar,
            fullName: req.user.fullName,
          },
        },
      });
    }
  }

  const postData = postWithStats.toJSON();

  emitSocketEvent({
    req,
    roomId: `post_${postId}`,
    event: SocketEventEnum.POST_REACT,
    payload: { postData, postId },
  });

  await Promise.all([
    DELETE_POST_CACHE(),
    DELETE_USER_SUMMARY_CACHE(receiverId),
    INVALID_POST_CACHE(userId),
    NOTIFICATION_CACHE(userId),
  ]);

  return res.json(new ApiResponse(200, postData, "React Successfully"));
});

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const currentUserId = req.user?.id;
  const cacheKey = `posts:public:page=${page}:limit=${limit}:user=${currentUserId}`;

  const responseData = await getOrSetCache(
    cacheKey,
    async () => {
      const { count, rows: posts } = await Post.findAndCountAll({
        limit,
        offset: skip,
        where: { privacy: "public" },
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
            as: "user",
            attributes: [
              ...USER_ATTRIBUTE,
              ...USER_ATTRIBUTE,
              getFollowerCountLiteral("\"Post\".\"authorId\""),
              getFollowingCountLiteral("\"Post\".\"authorId\""),
              getIsFollowingLiteral(currentUserId, "\"Post\".\"authorId\""),
            ],
          },
        ],
        attributes: {
          include: [
            getTotalCommentsCountLiteral("\"Post\""),
            getTotalReactionsCountLiteral("\"Post\""),
            getIsBookmarkedLiteral(currentUserId, "\"Post\""),
            getUserReactionLiteral(currentUserId, "\"Post\""),
          ],
        },
      });

      return {
        posts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    },
    60,
  );

  return res.json(
    new ApiResponse(200, responseData, "Posts retrieved successfully"),
  );
});

export const getSinglePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const post = await Post.findOne({
    where: { id: postId },
  });

  if (!post)
    throw new ApiError(404, "Post not found");

  const currentUserId = req.user?.id;
  const cacheKey = `posts:public:user=${currentUserId}:postId=${post.id}`;

  const responseData = await getOrSetCache(
    cacheKey,
    async () => {
      const post = await Post.findOne({
        where: { privacy: "public", id: postId },
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
            as: "user",
            attributes: [
              ...USER_ATTRIBUTE,
              ...USER_ATTRIBUTE,
              getFollowerCountLiteral("\"Post\".\"authorId\""),
              getFollowingCountLiteral("\"Post\".\"authorId\""),
              getIsFollowingLiteral(currentUserId, "\"Post\".\"authorId\""),
            ],
          },
        ],
        attributes: {
          include: [
            getTotalCommentsCountLiteral("\"Post\""),
            getTotalReactionsCountLiteral("\"Post\""),
            getIsBookmarkedLiteral(currentUserId, "\"Post\""),
            getUserReactionLiteral(currentUserId, "\"Post\""),
          ],
        },
      });

      return {
        post,
      };
    },
    60,
  );

  return res.json(
    new ApiResponse(200, responseData, "Posts retrieved successfully"),
  );
});

export const share = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const currentUserId = req.user?.id;

  const originalPost = await Post.findOne({
    where: { id: postId },
    include: [
      {
        model: User,
        required: false,
        attributes: USER_ATTRIBUTE,
        as: "user",
      },
    ],
  });

  if (!originalPost) {
    throw new ApiError(404, "Post not found");
  }

  originalPost.share = (originalPost.share || 0) + 1;
  await originalPost.save();

  const sharedPost = await Post.create({
    authorId: currentUserId,
    sharedPostId: originalPost.id,
    content: req.body.message || null,
    privacy: req.body.visibility || "public",
  });

  const postData = {
    ...sharedPost.toJSON(),
    user: {
      id: req.user.id,
      fullName: req.user?.fullName,
      avatar: req.user?.avatar,
      username: req?.user?.username,
    },
    replies: [],
    isBookmarked: false,
    originalPost,
    totalReactionsCount: 0,
    share: 0,
    totalCommentsCount: 0,
    currentUserReaction: null,
  };

  await DELETE_POST_CACHE();
  await INVALID_POST_CACHE(req.user.id);

  return res.json(
    new ApiResponse(
      201,
      {
        share: originalPost.share,
        sharedPostId: sharedPost.id,
        postData,
      },
      "Post shared successfully",
    ),
  );
});

export const bookmarkedPost = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findOne({ where: { id: postId } });
    if (!post)
      throw new ApiError(404, "Post not found");

    const bookmarkPost = await BookmarkPost.findOne({
      where: { userId, postId },
    });

    const removeRedisKey = async () => {
      await DELETE_POST_CACHE();

      await redis.keys("posts:bookmark:*").then((keys) => {
        if (keys.length > 0) {
          redis.del(...keys);
        }
      });
    };

    if (bookmarkPost) {
      await BookmarkPost.destroy({
        where: {
          userId,
          postId,
        },
      });
      await removeRedisKey();
      return res.json(new ApiResponse(200, null, "Bookmarked remove Post"));
    }
    else {
      const receiverId = Number(post.authorId);
      await BookmarkPost.create({ userId, postId });
      if (userId !== receiverId) {
        await createAndInvalidateNotification({
          req,
          senderId: userId,
          receiverId,
          type: NotificationType.BOOKMARK,
          postId: postId || null,
        });
      }

      await removeRedisKey();
      return res.json(new ApiResponse(200, null, "Bookmarked Post"));
    }
  },
);

export const editPost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const authorId = req.user.id;
  const { content, location, privacy } = req.body;
  const mediaPath = req.file?.path;
  const post = await Post.findOne({ where: { id: postId, authorId } });
  if (!post)
    throw new ApiError(400, "You are not able to edit this post");
  if (mediaPath && post.media) {
    await removeOldImageOnCloudinary(post.media);
  }

  let mediaUrl = null;
  if (mediaPath) {
    const media = await uploadFileOnCloudinary(
      mediaPath,
      "ummah_connect/posts",
    );
    mediaUrl = media?.url;
  }

  const [, updatePost] = await Post.update(
    { content, location, privacy, media: mediaUrl || post.media },
    { where: { id: postId, authorId }, returning: true },
  );

  await DELETE_POST_CACHE();
  await INVALID_POST_CACHE(req.user.id);

  return res.json(new ApiResponse(200, updatePost[0], "Update Successfully"));
});

export const deletePostImage = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const authorId = req.user.id;

    const post = await Post.findOne({ where: { id: postId, authorId } });
    if (!post)
      throw new ApiError(400, "You are not able to delete this post assets");
    if (!post.media)
      throw new ApiError(404, "Not found any asset related this post");

    if (post.media) {
      await removeOldImageOnCloudinary(post.media);
    }

    await Post.update({ media: null }, { where: { id: postId, authorId } });

    return res.json(new ApiResponse(200, null, "Delete successfully"));
  },
);

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const authorId = req.user.id;

  const post = await Post.findOne({ where: { id: postId, authorId } });
  if (!post)
    throw new ApiError(400, "You are not able to delete this post");

  if (post.media) {
    await removeOldImageOnCloudinary(post.media);
  }

  await Post.destroy({
    where: { id: postId, authorId },
  });

  await DELETE_POST_CACHE();
  await INVALID_POST_CACHE(req.user.id);

  res.json(new ApiResponse(200, null, "Post delete successfully"));
});

export const getFollowingPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const currentUserId = req.user?.id;

    const cacheKey = `posts:following:page=${page}:limit=${limit}:user=${currentUserId}`;

    const responseData = await getOrSetCache(
      cacheKey,
      async () => {
        const { count, rows: posts } = await Post.findAndCountAll({
          limit,
          offset: skip,
          where: {
            privacy: "public",
            authorId: {
              [Op.in]: sequelize.literal(`(SELECT "followingId" FROM "follows" WHERE "followerId" = ${currentUserId})`),
            },
          },
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
              as: "user",
              attributes: [
                ...USER_ATTRIBUTE,
                getFollowerCountLiteral("\"Post\".\"authorId\""),
                getFollowingCountLiteral("\"Post\".\"authorId\""),
                getIsFollowingLiteral(currentUserId, "\"Post\".\"authorId\""),
              ],
            },
          ],
          attributes: {
            include: [
              getTotalCommentsCountLiteral("\"Post\""),
              getTotalReactionsCountLiteral("\"Post\""),
              getIsBookmarkedLiteral(currentUserId, "\"Post\""),
              getUserReactionLiteral(currentUserId, "\"Post\""),
            ],
          },
        });

        return {
          posts,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        };
      },
      60,
    );

    res.json(
      new ApiResponse(
        200,
        responseData,
        "Following posts retrieved successfully",
      ),
    );
  },
);

export const getBookmarkPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const currentUserId = req.user.id;

    const cacheKey = `posts:bookmark:page=${page}:limit=${limit}:user=${currentUserId}`;

    const responseData = await getOrSetCache(cacheKey, async () => {
      const { count, rows } = await BookmarkPost.findAndCountAll({
        limit,
        offset: skip,
        where: {
          userId: req.user.id,
        },
        include: [
          {
            model: Post,
            as: "post",
            include: [
              {
                model: User,
                required: false,
                as: "user",
                attributes: [
                  ...USER_ATTRIBUTE,
                  getFollowerCountLiteral("\"post\".\"authorId\""),
                  getFollowingCountLiteral("\"post\".\"authorId\""),
                  getIsFollowingLiteral(currentUserId, "\"post\".\"authorId\""),
                ],
              },
            ],
            attributes: {
              ...POST_ATTRIBUTE,
              include: [
                getTotalCommentsCountLiteral("\"post\""),
                getTotalReactionsCountLiteral("\"post\""),
                getIsBookmarkedLiteral(currentUserId, "\"post\""),
                getUserReactionLiteral(currentUserId, "\"post\""),
              ],
            },
          },
        ],
      });

      return {
        posts: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    }, 60);

    return res.json(new ApiResponse(200, responseData, "Fetch bookmarked posts"));
  },
);

export const userSuggestion = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query.q?.toString().toLowerCase();
  const currentUserId = req.user?.id;

  const users = await User.findAll({
    where: {
      username: {
        [Op.iLike]: `${q}%`,
      },
      id: {
        [Op.ne]: currentUserId,
      },
    },
    limit: 10,
    attributes: [
      "id",
      "username",
      "avatar",
      "fullName",
      [
        sequelize.literal(`(
            SELECT COUNT(*) 
            FROM "follows" 
            WHERE "followingId" = "User"."id"
          )`),
        "followerCount",
      ],
      [
        sequelize.literal(`(
            SELECT EXISTS (
              SELECT 1 
              FROM "follows" 
              WHERE "followerId" = ${currentUserId} 
              AND "followingId" = "User"."id"
            )
          )`),
        "isFollowing",
      ],
    ],
    order: [
      ["username", "ASC"],
    ],
  });

  return res.json(
    new ApiResponse(200, users, "Users fetched successfully"),
  );
});

export const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const cacheKey = `user:${userId}:posts:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "Posts fetched from cache"));
  }

  const { rows: posts, count } = await Post.findAndCountAll({
    where: { authorId: userId, privacy: "public" },
    attributes: {
      include: [
        // [literal(`(SELECT COUNT(*) FROM "views" WHERE "views"."postId" = "Post"."id")`), "viewsCount"],
        [literal(`(SELECT COUNT(*) FROM "comments" WHERE "comments"."postId" = "Post"."id")`), "commentsCount"],
        [literal(`(SELECT COUNT(*) FROM "reactions" WHERE "reactions"."postId" = "Post"."id")`), "reactionsCount"],
      ],
    },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const data = {
    posts,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 60 * 10);

  return res.json(new ApiResponse(200, data, "My Posts fetched successfully"));
});

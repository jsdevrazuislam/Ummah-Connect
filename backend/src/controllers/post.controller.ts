import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Follow, Notification, Post, Reaction, User } from "@/models";
import {
  removeOldImageOnCloudinary,
  uploadFileOnCloudinary
} from "@/utils/cloudinary";
import { getOrSetCache } from "@/utils/helper";
import sequelize from "@/config/db";
import BookmarkPost from "@/models/bookmark.models";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import { Op } from "sequelize";
import { POST_ATTRIBUTE, USER_ATTRIBUTE } from "@/constants";
import {
  getFollowerCountLiteral,
  getFollowingCountLiteral,
  getIsBookmarkedLiteral,
  getIsFollowingLiteral,
  getTotalCommentsCountLiteral,
  getTotalReactionsCountLiteral,
  getUserReactionLiteral,
} from "@/utils/sequelize-sub-query";
import redis from "@/config/redis";
import { getFileTypeFromPath } from "@/utils/file-format";
import { postSchema } from "@/schemas/post.schema";
import { REDIS_KEY } from "@/controllers/notification.controller";
import { createAndInvalidateNotification } from "@/utils/notification";
import { NotificationType } from "@/models/notification.models";

export const create_post = asyncHandler(async (req: Request, res: Response) => {
  const data = postSchema.parse(req.body);
  const { content, location, privacy, background } = data;
  const authorId = req.user.id;
  const mediaPath = req.file?.path;
  let media_url = null;
  let contentType: 'text' | 'video' | 'audio' | 'picture' = 'text';

  if (mediaPath) {
    const uploaded = await uploadFileOnCloudinary(mediaPath, 'ummah_connect/posts');
    media_url = uploaded?.url;

    const mimeType = uploaded?.resource_type || getFileTypeFromPath(mediaPath);
    if (mimeType?.startsWith('video')) contentType = 'video';
    else if (mimeType?.startsWith('audio')) contentType = 'audio';
    else if (mimeType?.startsWith('image')) contentType = 'picture';
    else contentType = 'text';
  }

  const payload = {
    content,
    location,
    privacy,
    media: media_url,
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
      full_name: req.user?.full_name,
      avatar: req.user?.avatar,
      username: req?.user?.username,
      location: req.user?.location,
      bio: req.user?.bio,
      followers_count: followerCount,
      following_count: followingCount,
      isFollowing: false,
    },
    replies: [],
    isBookmarked: false,
    totalReactionsCount: 0,
    share: 0,
    totalCommentsCount: 0,
    currentUserReaction: null
  };

  await redis.keys("posts:public:*").then((keys) => {
    if (keys.length > 0) {
      redis.del(...keys);
    }
  });

  return res.json(new ApiResponse(200, postData, "Post Created Successfully"));
});

export const post_react = asyncHandler(async (req: Request, res: Response) => {
  const { react_type, icon } = req.body;
  const postId = req.params?.postId;
  const userId = req.user?.id;

  const [reaction, created] = await Reaction.findOrCreate({
    where: { userId, postId },
    defaults: { react_type, icon },
  });

  if (!created) {
    await reaction.update({ react_type: react_type ? react_type : null, icon: icon ? icon : null });
  }

  const postWithStats = await Post.findOne({
    where: { id: postId },
    attributes: {
      include: [
        getTotalReactionsCountLiteral('"Post"'),
        getUserReactionLiteral(userId, '"Post"'),
      ],
    },
  });

  if (!postWithStats) throw new ApiError(404, 'Post not found');
  const receiverId = postWithStats.authorId;

  if (userId !== Number(receiverId)) {
    let notification = await Notification.findOne({
      where: {
        sender_id: userId,
        receiver_id: receiverId,
        post_id: postId,
        type: 'like',
      },
    });


    if (notification) {
      await notification.update({
        icon,
        is_read: false,
        updatedAt: new Date(),
      });
    } else {
      notification = await Notification.create({
        sender_id: userId,
        receiver_id: receiverId,
        type: 'like',
        icon,
        post_id: postId,
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
          full_name: req.user.full_name,
        },
      },
    });
  }

  const postData = postWithStats.toJSON();

  emitSocketEvent({
    req,
    roomId: `post_${postId}`,
    event: SocketEventEnum.POST_REACT,
    payload: { postData, postId: Number(postId) },
  });

  await redis.keys("posts:public:*").then((keys) => {
    if (keys.length > 0) redis.del(...keys);
  });

  const keys = await redis.keys(`${REDIS_KEY(userId)}*`);
  if (keys.length > 0) await redis.del(...keys);

  return res.json(new ApiResponse(200, postData, "React Successfully"));
});


export const get_posts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const currentUserId = req.user?.id;
  const cacheKey = `posts:public:page=${page}:limit=${limit}:user=${currentUserId}`;

  const responseData = await getOrSetCache(
    cacheKey,
    async () => {
      const { count, rows: posts } = await Post.findAndCountAll({
        limit: limit,
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
                  getFollowerCountLiteral('"originalPost->user"."id"'),
                  getFollowingCountLiteral('"originalPost->user"."id"'),
                  getIsFollowingLiteral(
                    currentUserId,
                    '"originalPost->user"."id"'
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
              getFollowerCountLiteral('"Post"."authorId"'),
              getFollowingCountLiteral('"Post"."authorId"'),
              getIsFollowingLiteral(currentUserId, '"Post"."authorId"'),
            ],
          },
        ],
        attributes: {
          include: [
            getTotalCommentsCountLiteral('"Post"'),
            getTotalReactionsCountLiteral('"Post"'),
            getIsBookmarkedLiteral(currentUserId, '"Post"'),
            getUserReactionLiteral(currentUserId, '"Post"'),
          ],
        },
      });

      return {
        posts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    },
    60
  );

  return res.json(
    new ApiResponse(200, responseData, "Posts retrieved successfully")
  );
});

export const get_single_post = asyncHandler(async (req: Request, res: Response) => {

  const postId = req.params.id
  const post = await Post.findOne({
    where: { id: postId }
  })

  if (!post) throw new ApiError(404, 'Post not found')

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
                  getFollowerCountLiteral('"originalPost->user"."id"'),
                  getFollowingCountLiteral('"originalPost->user"."id"'),
                  getIsFollowingLiteral(
                    currentUserId,
                    '"originalPost->user"."id"'
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
              getFollowerCountLiteral('"Post"."authorId"'),
              getFollowingCountLiteral('"Post"."authorId"'),
              getIsFollowingLiteral(currentUserId, '"Post"."authorId"'),
            ],
          },
        ],
        attributes: {
          include: [
            getTotalCommentsCountLiteral('"Post"'),
            getTotalReactionsCountLiteral('"Post"'),
            getIsBookmarkedLiteral(currentUserId, '"Post"'),
            getUserReactionLiteral(currentUserId, '"Post"'),
          ],
        },
      });

      return {
        post
      };
    },
    60
  );

  return res.json(
    new ApiResponse(200, responseData, "Posts retrieved successfully")
  );

})

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
      full_name: req.user?.full_name,
      avatar: req.user?.avatar,
      username: req?.user?.username,
    },
    replies: [],
    isBookmarked: false,
    originalPost,
    totalReactionsCount: 0,
    share: 0,
    totalCommentsCount: 0,
    currentUserReaction: null
  };

  await redis.keys("posts:public:*").then((keys) => {
    if (keys.length > 0) {
      redis.del(...keys);
    }
  });

  return res.json(
    new ApiResponse(
      201,
      {
        share: originalPost.share,
        sharedPostId: sharedPost.id,
        postData,
      },
      "Post shared successfully"
    )
  );
});

export const bookmarked_post = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findOne({ where: { id: postId } });
    if (!post) throw new ApiError(404, "Post not found");

    const bookmarkPost = await BookmarkPost.findOne({
      where: { userId, postId },
    });

    const removeRedisKey = async () => {
      await redis.keys("posts:public:*").then((keys) => {
        if (keys.length > 0) {
          redis.del(...keys);
        }
      });

      await redis.keys("posts:bookmark:*").then((keys) => {
        if (keys.length > 0) {
          redis.del(...keys);
        }
      });
    }

    if (bookmarkPost) {
      await BookmarkPost.destroy({
        where: {
          userId,
          postId,
        },
      });
      await removeRedisKey()
      return res.json(new ApiResponse(200, null, "Bookmarked remove Post"));
    } else {
      const receiverId = Number(post.authorId)
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
      
      await removeRedisKey()
      return res.json(new ApiResponse(200, null, "Bookmarked Post"));
    }
  }
);

export const edit_post = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const authorId = req.user.id;
  const { content, location, privacy } = req.body;
  const mediaPath = req.file?.path;
  const post = await Post.findOne({ where: { id: postId, authorId } });
  if (!post) throw new ApiError(400, "You are not able to edit this post");
  if (mediaPath && post.media) {
    await removeOldImageOnCloudinary(post.media);
  }

  let media_url = null;
  if (mediaPath) {
    const media = await uploadFileOnCloudinary(
      mediaPath,
      "ummah_connect/posts"
    );
    media_url = media?.url;
  }

  const [, updatePost] = await Post.update(
    { content, location, privacy, media: media_url ? media_url : post.media },
    { where: { id: postId, authorId }, returning: true }
  );

  await redis.keys("posts:public:*").then((keys) => {
    if (keys.length > 0) {
      redis.del(...keys);
    }
  });

  return res.json(new ApiResponse(200, updatePost[0], "Update Successfully"));
});

export const delete_post_image = asyncHandler(
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
  }
);

export const delete_post = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const authorId = req.user.id;

  const post = await Post.findOne({ where: { id: postId, authorId } });
  if (!post) throw new ApiError(400, "You are not able to delete this post");

  if (post.media) {
    await removeOldImageOnCloudinary(post.media);
  }

  await Post.destroy({
    where: { id: postId, authorId },
  });

  await redis.keys("posts:public:*").then((keys) => {
    if (keys.length > 0) {
      redis.del(...keys);
    }
  });

  res.json(new ApiResponse(200, null, "Post delete successfully"));
});

export const get_following_posts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const currentUserId = req.user?.id;

    const cacheKey = `posts:following:page=${page}:limit=${limit}:user=${currentUserId}`;

    const responseData = await getOrSetCache(
      cacheKey,
      async () => {
        const { count, rows: posts } = await Post.findAndCountAll({
          limit: limit,
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
                    getFollowerCountLiteral('"originalPost->user"."id"'),
                    getFollowingCountLiteral('"originalPost->user"."id"'),
                    getIsFollowingLiteral(
                      currentUserId,
                      '"originalPost->user"."id"'
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
                getFollowerCountLiteral('"Post"."authorId"'),
                getFollowingCountLiteral('"Post"."authorId"'),
                getIsFollowingLiteral(currentUserId, '"Post"."authorId"'),
              ],
            },
          ],
          attributes: {
            include: [
              getTotalCommentsCountLiteral('"Post"'),
              getTotalReactionsCountLiteral('"Post"'),
              getIsBookmarkedLiteral(currentUserId, '"Post"'),
              getUserReactionLiteral(currentUserId, '"Post"'),
            ],
          },
        });

        return {
          posts,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        };
      },
      60
    );

    res.json(
      new ApiResponse(
        200,
        responseData,
        "Following posts retrieved successfully"
      )
    );
  }
);

export const get_bookmark_posts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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
                  getFollowerCountLiteral('"post"."authorId"'),
                  getFollowingCountLiteral('"post"."authorId"'),
                  getIsFollowingLiteral(currentUserId, '"post"."authorId"'),
                ],
              },
            ],
            attributes: {
              ...POST_ATTRIBUTE,
              include: [
                getTotalCommentsCountLiteral('"post"'),
                getTotalReactionsCountLiteral('"post"'),
                getIsBookmarkedLiteral(currentUserId, '"post"'),
                getUserReactionLiteral(currentUserId, '"post"'),
              ],
            },
          },
        ],
      });

      return {
        posts: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      }
    }, 60)

    return res.json(new ApiResponse(200, responseData, "Fetch bookmarked posts"));
  }
);

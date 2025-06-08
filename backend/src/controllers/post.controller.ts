import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Follow, Post, Reaction, User } from "@/models";
import { postSchema } from "@/schemas/post.schema";
import uploadFileOnCloudinary, {
  removeOldImageOnCloudinary,
} from "@/utils/cloudinary";
import { formatTimeAgo, getOrSetCache } from "@/utils/helper";
import sequelize from "@/config/db";
import BookmarkPost from "@/models/bookmark.models";
import { ReactPostType } from "@/types/post";
import { formatPosts } from "@/utils/formater";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import { Op } from "sequelize";
import { POST_ATTRIBUTE, REACT_ATTRIBUTE, USER_ATTRIBUTE } from "@/constants";
import { getFollowerCountLiteral, getFollowingCountLiteral, getIsFollowingLiteral, getTotalCommentsCountLiteral, getTotalReactionsCountLiteral } from "@/utils/sequelize-sub-query";
import redis from "@/config/redis";

export const create_post = asyncHandler(async (req: Request, res: Response) => {
  const data = postSchema.parse(req.body);
  const { content, location, privacy } = data;
  const authorId = req.user.id;
  const mediaPath = req.file?.path;
  let media_url = null;
  if (mediaPath) {
    const media = await uploadFileOnCloudinary(
      mediaPath,
      "ummah_connect/posts"
    );
    media_url = media?.url;
  }

  const payload = {
    content,
    location,
    privacy,
    media: media_url,
    authorId,
  };

  const newPost = await Post.create(payload);
  const followerCount = await Follow.count({ where: { followingId: req.user.id } });
  const followingCount = await Follow.count({ where: { followerId: req.user.id } });



  const postData = {
    ...newPost.toJSON(),
    image: newPost.media,
    timestamp: formatTimeAgo(newPost.createdAt),
    user: {
      id: authorId,
      full_name: req.user?.full_name,
      avatar: req.user?.avatar,
      username: req?.user?.username,
      location: req.user?.location,
      bio: req.user?.bio,
      followers_count: followerCount,
      following_count: followingCount,
      isFollowing: false
    },
    replies: [],
    isBookmarked: false,
    likes: 0,
    comments: {
      total: 0,
      preview: [],
    },
    shares: 0,
    reactions: {
      counts: 0,
      currentUserReaction: null,
    },
  };

  await redis.keys('posts:public:*').then((keys) => {
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

  function reactions(posts: ReactPostType[]) {
    const reactionCounts = posts.reduce((acc, reaction) => {
      acc[reaction.react_type] = (acc[reaction.react_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currentUserReaction = posts.find((r) => r.userId === req.user.id);

    return {
      reactions: {
        counts: reactionCounts,
        currentUserReaction: currentUserReaction?.react_type || null,
      }
    }
  }

  const oldReact = await Reaction.findOne({ where: { userId, postId } });
  if (oldReact) {
    await Reaction.update(
      { react_type, icon },
      {
        where: { userId, postId },
      }
    );
    const posts = await Reaction.findAll({ where: { postId } })
    const reactionCounts = reactions(posts)

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.POST_REACT, payload: { postData: reactionCounts, postId: Number(postId) } })


    return res.json(
      new ApiResponse(
        200,
        reactionCounts,
        "React Successfully"
      )
    );
  } else {

    await Reaction.create({
      userId,
      postId,
      react_type,
      icon,
    });

    const posts = await Reaction.findAll({ where: { postId } })
    const reactionCounts = reactions(posts)

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.POST_REACT, payload: { postData: reactionCounts, postId: Number(postId) } })

    return res.json(
      new ApiResponse(200, reactionCounts, "React Successfully")
    );
  }
});

export const get_posts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const currentUserId = req.user?.id;
  const cacheKey = `posts:public:page=${page}:limit=${limit}:user=${currentUserId}`;


  const responseData = await getOrSetCache(cacheKey, async () =>{
     const { count, rows: posts } = await Post.findAndCountAll({
      limit: limit,
      offset: skip,
      where: { privacy: 'public' },
      include: [
        {
          model: Post,
          as: 'originalPost',
          attributes: POST_ATTRIBUTE,
          include: [
            {
              model: User,
              as: 'user',
              attributes: [
                  ...USER_ATTRIBUTE,
                  getFollowerCountLiteral('"originalPost->user"."id"'), 
                  getFollowingCountLiteral('"originalPost->user"."id"'), 
                  getIsFollowingLiteral(currentUserId, '"originalPost->user"."id"') 
              ]
            },
          ]
        },
        {
          model: Reaction,
          required: false,
          attributes: REACT_ATTRIBUTE,
          as: 'reactions'
        },
        {
          model: BookmarkPost,
          attributes: ['id', 'postId', 'userId'],
          as: 'bookmarks'
        },
        {
          model: User,
          required: false,
          as: 'user',
          attributes: [
            ...USER_ATTRIBUTE,
            ...USER_ATTRIBUTE,
              getFollowerCountLiteral('"Post"."authorId"'),
              getFollowingCountLiteral('"Post"."authorId"'),
              getIsFollowingLiteral(currentUserId, '"Post"."authorId"')
          ]
        }
      ],
      attributes: {
        include: [
          getTotalCommentsCountLiteral('"Post"'),
          getTotalReactionsCountLiteral('"Post"')
        ],
      }
    });

    const formatPostData = formatPosts(posts, currentUserId);
    return {
        posts: formatPostData,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      };
    }, 60)


  return res.json(
    new ApiResponse(
      200, responseData, "Posts retrieved successfully"
    )
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
        as: 'user'
      }
    ]
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
    privacy: req.body.visibility || 'public'
  });

  const postData = {
    ...sharedPost.toJSON(),
    timestamp: formatTimeAgo(sharedPost.createdAt),
    user: {
      id: req.user.id,
      full_name: req.user?.full_name,
      avatar: req.user?.avatar,
      username: req?.user?.username,
    },
    replies: [],
    isBookmarked: false,
    originalPost,
    likes: 0,
    comments: {
      total: 0,
      preview: [],
    },
    shares: 0,
    reactions: {
      counts: 0,
      currentUserReaction: null,
    },
  };

  return res.json(new ApiResponse(201, {
    shares: originalPost.share,
    sharedPostId: sharedPost.id,
    postData
  }, "Post shared successfully"));
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

    if (bookmarkPost) {
      await BookmarkPost.destroy({
        where: {
          userId,
          postId,
        },
      });

      return res.json(new ApiResponse(200, null, "Bookmarked remove Post"));
    } else {
      await BookmarkPost.create({ userId, postId });

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

  const [_, updatePost] = await Post.update(
    { content, location, privacy, media: media_url ? media_url : post.media },
    { where: { id: postId, authorId }, returning: true }
  );

  return res.json(new ApiResponse(200, updatePost[0], "Update Successfully"));
});

export const delete_post_image = asyncHandler(async (req: Request, res: Response) => {

  const postId = req.params.postId;
  const authorId = req.user.id;

  const post = await Post.findOne({ where: { id: postId, authorId } });
  if (!post) throw new ApiError(400, "You are not able to delete this post assets");
  if (!post.media) throw new ApiError(404, "Not found any asset related this post");

  if (post.media) {
    await removeOldImageOnCloudinary(post.media);
  }

  await Post.update(
    { media: null },
    { where: { id: postId, authorId } }
  );

  return res.json(new ApiResponse(200, null, 'Delete successfully'))
})

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

  res.json(new ApiResponse(200, null, "Post delete successfully"));
});

export const get_following_posts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const currentUserId = req.user?.id;

    const { count, rows: posts } = await Post.findAndCountAll({
      limit: limit,
      offset: skip,
      where: {
        privacy: 'public',
        authorId: {
          [Op.in]: sequelize.literal(`(
          SELECT "followingId" FROM "follows" WHERE "followerId" = ${currentUserId}
        )`)
        }
      },
      include: [
        {
          model: Post,
          as: 'originalPost',
          attributes: POST_ATTRIBUTE,
          include: [
            {
              model: User,
              as: 'user',
              attributes: [
                ...USER_ATTRIBUTE,
                getFollowerCountLiteral('"originalPost->user"."id"'), 
                getFollowingCountLiteral('"originalPost->user"."id"'), 
                getIsFollowingLiteral(currentUserId, '"originalPost->user"."id"') 
              ]
            },
          ]
        },
        {
          model: Reaction,
          required: false,
          attributes: REACT_ATTRIBUTE,
          as: 'reactions'
        },
        {
          model: BookmarkPost,
          attributes: ['id', 'postId', 'userId'],
          as: 'bookmarks'
        },
        {
          model: User,
          required: false,
          as: 'user',
          attributes: [
            ...USER_ATTRIBUTE,
            getFollowerCountLiteral('"Post"."authorId"'),
            getFollowingCountLiteral('"Post"."authorId"'),
            getIsFollowingLiteral(currentUserId, '"Post"."authorId"')
          ]
        }
      ],
      attributes: {
        include: [
          getTotalCommentsCountLiteral('"Post"'),
          getTotalReactionsCountLiteral('"Post"')
        ],
      }
    });

    res.json(
      new ApiResponse(200, {
        posts: formatPosts(posts, currentUserId),
        totalPages: Math.ceil(count / limit),
        currentPage: page
      }, 'Following posts retrieved successfully')
    )
  })
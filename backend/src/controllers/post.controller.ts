import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Post, Reaction, User, Comment } from "@/models";
import { postSchema } from "@/schemas/post.schema";
import uploadFileOnCloudinary, {
  removeOldImageOnCloudinary,
} from "@/utils/cloudinary";
import { formatTimeAgo } from "@/utils/helper";
import sequelize from "@/config/db";
import BookmarkPost from "@/models/bookmark.models";
import { ReactPostType } from "@/types/post";
import { formatPosts } from "@/utils/formater";
import { emitSocketEvent, SocketEventEnum } from "@/socket";

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
    media_url = media;
  }

  const payload = {
    content,
    location,
    privacy,
    media: media_url,
    authorId,
  };

  const newPost = await Post.create(payload);

  const postData = {
    ...newPost.toJSON(),
    image: newPost.media,
    timestamp: formatTimeAgo(newPost.createdAt),
    user: {
      id: authorId,
      full_name: req.user?.full_name,
      avatar: req.user?.avatar,
      username: req?.user?.username,
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

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.POST_REACT, payload: { postData:reactionCounts, postId: Number(postId)}})


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

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.POST_REACT, payload: { postData:reactionCounts, postId: Number(postId)}})

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

  const user_attribute = ['id', 'username', 'full_name', 'avatar']
  const react_attribute = ['userId', 'react_type', 'icon', 'commentId', 'postId']
  const comment_attribute = ['id', 'postId', 'isEdited', 'parentId', 'content', 'createdAt']

  const { count, rows: posts} = await Post.findAndCountAll({
    limit: limit,
    offset: skip,
    where: { privacy: 'public' },
    include: [
      {
        model: Comment,
        as: 'comments',
        where: { parentId: null },
        required: false,
        attributes: comment_attribute,
        include: [
          {
            model: Comment,
            as: 'replies',
            required: false,
            attributes: comment_attribute,
            include: [
              { model: User, attributes: user_attribute, as: 'user' },
               {
                model: Reaction,
                required: false,
                attributes: react_attribute,
                as: 'reactions'
              }
            ]
          },
          { model: User, attributes: user_attribute, as: 'user' },
          {
            model: Reaction,
            required: false,
            attributes: react_attribute,
            as: 'reactions'
          }
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
    new ApiResponse(
      200, {
        posts: formatPostData,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      },
      "Posts retrieved successfully"
    )
  );
});

export const share = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  post.share = (post.share || 0) + 1;
  await post.save();

  return res.json(new ApiResponse(200, { shares: post.share }, "Success"));
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
    media_url = media;
  }

  const [_, updatePost] = await Post.update(
    { content, location, privacy, media: media_url },
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

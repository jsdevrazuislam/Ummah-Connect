import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Post, PostReaction, User, Comment } from "@/models";
import { Op } from "sequelize";
import { sendEmail } from "@/utils/send-email";
import { JwtResponse } from "@/types/auth";
import { postSchema } from "@/schemas/post.schema";
import uploadFileOnCloudinary, {
  removeOldImageOnCloudinary,
} from "@/utils/cloudinary";
import { formatTimeAgo } from "@/utils/helper";
import sequelize from "@/config/db";
import CommentReaction from "@/models/comment-react.models";
import BookmarkPost from "@/models/bookmark.models";
import { CommentResponse, ReactPostType } from "@/types/post";

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
      name: req.user?.full_name,
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

  const oldReact = await PostReaction.findOne({ where: { userId, postId } });
  if (oldReact) {
    await PostReaction.update(
      { react_type, icon },
      {
        where: { userId, postId },
      }
    );
    const posts = await PostReaction.findAll({ where: { postId}})
    const reactionCounts = reactions(posts)

    return res.json(
      new ApiResponse(
        200,
        reactionCounts,
        "React Successfully"
      )
    );
  } else {

    await PostReaction.create({
      userId,
      postId,
      react_type,
      icon,
    });

    const posts = await PostReaction.findAll({ where: { postId}})
    const reactionCounts = reactions(posts)

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

  const { count, rows: posts } = await Post.findAndCountAll({
    limit,
    offset: skip,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "full_name", "avatar", "username"],
      },
    ],
  });

  const userBookmarks = currentUserId
    ? await BookmarkPost.findAll({
      where: { userId: currentUserId },
      attributes: ["postId"],
    })
    : [];
  const bookmarkPostIds = new Set(userBookmarks.map((b) => b.postId));

  const postIds = posts.map((post) => post.id);

  const postReactions = await PostReaction.findAll({
    where: { postId: postIds },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id"],
      },
    ],
  });

  const commentCounts = await Comment.findAll({
    attributes: [
      "postId",
      [sequelize.fn("COUNT", sequelize.col("id")), "totalComments"],
    ],
    where: { postId: postIds },
    group: ["postId"],
  });

  const formattedPosts = await Promise.all(
    posts.map(async (post) => {
      const isBookmarked = bookmarkPostIds.has(post.id);

      const currentPostReactions = postReactions.filter(
        (r) => r.postId === post.id
      );
      const currentUserReaction = currentPostReactions.find(
        (r) => r.userId === currentUserId
      );

      const reactionCounts = currentPostReactions.reduce((acc, reaction) => {
        acc[reaction.react_type] = (acc[reaction.react_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commentCount = commentCounts.find((c) => c.postId === post.id);
      const totalComments = commentCount
        ? parseInt(commentCount.get("totalComments") as string)
        : 0;

      const comments = await Comment.findAll({
        where: { postId: post.id, parentId: null },
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "full_name", "avatar", "username"],
          },
          {
            model: Comment,
            as: "replies",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "full_name", "avatar"],
              },
            ],
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      const formattedComments: CommentResponse[] = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        user: {
          id: comment.user.id,
          name: comment.user.full_name,
          username: comment.user.username,
          avatar: comment.user.avatar,
        },
        replies:
          comment.replies?.map((reply) => ({
            id: reply.id,
            content: reply.content,
            user: {
              id: reply.user.id,
              name: reply.user.full_name,
              username: reply.user.username,
              avatar: reply.user.avatar,
            },
            replies: [],
            repliesCount: 0,
            reactions: { counts: {}, currentUserReaction: null },
          })) || [],
        repliesCount: comment.replies?.length || 0,
        reactions: { counts: {}, currentUserReaction: null },
        createdAt: comment.createdAt,
      }));

      return {
        id: post.id,
        user: {
          id: post.author.id,
          name: post.author.full_name,
          username: post.author.username,
          avatar: post.author.avatar,
        },
        content: post.content,
        timestamp: formatTimeAgo(post.createdAt),
        isBookmarked,
        likes: Object.values(reactionCounts).reduce(
          (sum, count) => sum + count,
          0
        ),
        comments: {
          total: totalComments,
          preview: formattedComments,
        },
        shares: post.share || 0,
        image: post.media,
        location: post.location,
        reactions: {
          counts: reactionCounts,
          currentUserReaction: currentUserReaction?.react_type || null,
        },
      };
    })
  );

  return res.json(
    new ApiResponse(
      200,
      {
        posts: formattedPosts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
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
  const authorId = req.user;
  const { content, location, privacy } = req.body;
  const mediaPath = req.file?.path;
  const post = await Post.findOne({ where: { id: postId, authorId } });
  if (!post) throw new ApiError(400, "You are not able to edit this post");
  if (post.media) {
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

  await Post.update(
    { content, location, privacy, media: media_url },
    { where: { id: postId, authorId } }
  );

  return res.json(new ApiResponse(200, null, "Update Successfully"));
});

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

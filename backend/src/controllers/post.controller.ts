import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Post, PostReaction, User, Comment } from "@/models";
import { Op } from "sequelize";
import { sendEmail } from "@/utils/send-email";
import { JwtResponse } from "@/types/auth";
import { postSchema } from "@/schemas/post.schema";
import uploadFileOnCloudinary from "@/utils/cloudinary";
import { formatTimeAgo } from "@/utils/helper";
import sequelize from "@/config/db";

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

  return res.json(new ApiResponse(200, newPost, "Post Created Successfully"));
});

export const post_react = asyncHandler(async (req: Request, res: Response) => {
  const { react_type, icon } = req.body;
  const postId = req.params?.postId;
  const userId = req.user?.id;

  const oldReact = await PostReaction.findOne({ where: { userId, postId } });
  if (oldReact) {
    await PostReaction.update(
      { react_type, icon },
      { where: { userId, postId } }
    );
    return res.json(new ApiResponse(200, null, "React Successfully"));
  } else {
    await PostReaction.create({ userId, postId, react_type, icon });
    return res.json(new ApiResponse(200, null, "React Successfully"));
  }
});

export const get_posts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

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

  const formattedPosts = await Promise.all(
    posts.map(async (post) => {
      const commentCount = await Comment.count({
        where: { postId: post.id },
      });

      const { count: likeCount } = await PostReaction.findAndCountAll({
        where: { postId: post.id },
        attributes: [
          "react_type",
          [sequelize.fn("COUNT", sequelize.col("react_type")), "count"],
        ],
        group: ["react_type"],
      });

      return {
        id: post.id,
        user: {
          name: post.author.full_name,
          username: post.author.username,
          avatar: post.author.avatar,
        },
        content: post.content,
        timestamp: formatTimeAgo(post.createdAt),
        likes: likeCount,
        comments: commentCount,
        shares: post.share || 0,
        image: post.media,
        location: post.location,
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

  return res.json(
    new ApiResponse(200, { shares: post.share }, "Success")
  )
});

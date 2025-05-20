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

export const get_posts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.findAll({
    include: [
      {
        model: Comment,
        as: "comments",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "full_name", "avatar"],
          },
        ],
      },
      {
        model: PostReaction,
        as: "reactions",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "full_name", "avatar"],
          },
        ],
      },
      {
        model: User,
        as: "author",
        attributes: ["id", "full_name", "avatar"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.json(new ApiResponse(200, posts, "get all post successfully"));
});

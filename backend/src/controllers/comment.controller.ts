import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Post, User, Comment } from "@/models";
import { Op } from "sequelize";
import { sendEmail } from "@/utils/send-email";
import { JwtResponse } from "@/types/auth";

export const create_comment = asyncHandler(
  async (req: Request, res: Response) => {
    const { content } = req.body;
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findOne({ where: { id: postId } });
    if (!post) throw new ApiError(404, "Post not found");

    const comment = await Comment.create({ content, userId, postId });

    const commentJSON = comment.toJSON();
    delete commentJSON.userId;
    delete commentJSON.postId;


    return res.json(
      new ApiResponse(
        200,
        {
          ...commentJSON,
          author: {
            id: req.user.id,
            full_name: req.user.full_name,
            email: req.user.email,
            avatar: req.user.avatar,
          },
        },
        "Comment Created"
      )
    );
  }
);

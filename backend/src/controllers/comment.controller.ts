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
          user: {
            id: req.user.id,
            name: req.user.full_name,
            username: req.user.username,
            avatar: req.user.avatar,
          },
          replies: [],
          repliesCount: 0,
          reactions : {counts: {}, currentUserReaction: null}
        },
        "Comment Created"
      )
    );
  }
);

export const create_reply_comment = asyncHandler(async (req: Request, res: Response) => {

  const { content, postId } = req.body;
  const userId = req.user.id;
  const parentId = Number(req.params.id);

  const post = await Post.findOne({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  const comment = await Comment.create({ content, userId, postId, parentId });

  const commentJSON = comment.toJSON();
  delete commentJSON.userId;
  delete commentJSON.postId;
  delete commentJSON.parentId;


  return res.json(
    new ApiResponse(
      200,
      {
        ...commentJSON,
        user: {
          id: req.user.id,
          name: req.user.full_name,
          username: req.user.username,
          avatar: req.user.avatar,
        },
        parentId,
        createdAt: comment.createdAt,
        reactions : {counts: {}, currentUserReaction: null}
      },
      "Comment Created"
    )
  );
})


export const edit_comment = asyncHandler(async(req:Request, res:Response) =>{

  const commentId = req.params.id
  const userId = req.user.id
  const { postId, content, isReply} = req.body

  const comment = await Comment.findOne({ where: { id: commentId, postId, userId }})
  if(!comment) throw new ApiError(400, 'You are not eligible edit this comment')

  const [_, updatedComment] = await Comment.update(
    {content, isEdited: true},
    {where: { id: commentId }, returning: true}
  )

  const response = {
    content: updatedComment[0].content,
    id: updatedComment[0].id,
    isEdited: updatedComment[0].isEdited,
    parentId: updatedComment[0].parentId,
    user:{
      id: req.user.id,
      name: req.user.full_name,
      avatar: req.user.avatar,
      username: req.user.username
    },
    isReply
  }

  return res.json(new ApiResponse(200, response, 'Updated comment'))
})
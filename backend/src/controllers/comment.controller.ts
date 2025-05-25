import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Post, Comment, User, Reaction } from "@/models";
import { ReactPostType } from "@/types/post";
import CommentReaction from "@/models/react.models";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import { formatComments } from "@/utils/formater";

export const create_comment = asyncHandler(
  async (req: Request, res: Response) => {
    const { content } = req.body;
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findOne({ where: { id: postId } });
    if (!post) throw new ApiError(404, "Post not found");

    const comment = await Comment.create({ content, userId, postId });
    const totalComments = await Comment.count({
      where: {
        postId 
      }
    })

    const commentJSON = comment.toJSON();
    delete commentJSON.userId;

    const response = {
      ...commentJSON,
      user: {
        id: req.user.id,
        full_name: req.user.full_name,
        username: req.user.username,
        avatar: req.user.avatar,
      },
      replies: [],
      repliesCount: 0,
      totalComments,
      reactions: { counts: {}, currentUserReaction: null }
    }

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.CREATE_COMMENT, payload: { data: response } })

    return res.json(
      new ApiResponse(
        200,
        response,
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
  const totalComments = await Comment.count({
      where: {
        postId 
      }
    })

  const commentJSON = comment.toJSON();
  delete commentJSON.userId;

  const response = {
    ...commentJSON,
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      username: req.user.username,
      avatar: req.user.avatar,
    },
    parentId,
    createdAt: comment.createdAt,
    totalComments,
    reactions: { counts: {}, currentUserReaction: null }
  }


  emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.REPLY_COMMENT, payload: { data: response } })


  return res.json(
    new ApiResponse(
      200,
      response,
      "Comment Created"
    )
  );
})


export const edit_comment = asyncHandler(async (req: Request, res: Response) => {

  const commentId = req.params.id
  const userId = req.user.id
  const { postId, content, isReply } = req.body

  const comment = await Comment.findOne({ where: { id: commentId, postId, userId } })
  if (!comment) throw new ApiError(400, 'You are not eligible edit this comment')

  const [_, updatedComment] = await Comment.update(
    { content, isEdited: true },
    { where: { id: commentId }, returning: true }
  )

  const response = {
    content: updatedComment[0].content,
    id: updatedComment[0].id,
    isEdited: updatedComment[0].isEdited,
    parentId: updatedComment[0].parentId,
    postId: Number(postId),
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      avatar: req.user.avatar,
      username: req.user.username
    },
    isReply
  }

  emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.EDITED_COMMENT, payload: response })

  return res.json(new ApiResponse(200, response, 'Updated comment'))
})

export const delete_comment = asyncHandler(async (req: Request, res: Response) => {

  const commentId = req.params.id;
  const userId = req.user.id
  const comment = await Comment.findOne({ where: { id: commentId, userId } })
  if (!comment) throw new ApiError(400, 'You are not eligible to delete this comment')

  await Comment.destroy({
    where: {
      id: commentId
    }
  })

  const totalComments = await Comment.count({
    where: { 
      postId: comment.postId
    }
  })

  emitSocketEvent({ req, roomId: `post_${comment.postId}`, event: SocketEventEnum.DELETE_COMMENT, payload: { ...comment.toJSON(), isReply: comment.parentId ? true : false } })

  return res.json(
    new ApiResponse(200, totalComments, 'Comment delete success')
  )
})

export const comment_react = asyncHandler(async (req: Request, res: Response) => {
  const { react_type, icon, postId, parentId, isReply } = req.body;
  const commentId = req.params?.commentId;
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

  const oldReact = await CommentReaction.findOne({ where: { userId, commentId } });
  if (oldReact) {
    await CommentReaction.update(
      { react_type, icon },
      {
        where: { userId, commentId },
      }
    );
    const posts = await CommentReaction.findAll({ where: { commentId } })
    const reactionCounts = reactions(posts)

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.COMMENT_REACT, payload: { data: { ...reactionCounts }, postId: Number(postId), commentId: Number(commentId), parentId: Number(parentId), isReply: Boolean(isReply) } })


    return res.json(
      new ApiResponse(
        200,
        reactionCounts,
        "React Successfully"
      )
    );
  } else {

    await CommentReaction.create({
      userId,
      commentId,
      react_type,
      icon,
    });

    const posts = await CommentReaction.findAll({ where: { commentId } })
    const reactionCounts = reactions(posts)

    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.COMMENT_REACT, payload: { data: { ...reactionCounts }, postId: Number(postId), commentId: Number(commentId), parentId: Number(parentId), isReply: Boolean(isReply) } })


    return res.json(
      new ApiResponse(200, reactionCounts, "React Successfully")
    );
  }
});

export const get_comments = asyncHandler(async (req: Request, res: Response) => {

  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  const user_attribute = ['id', 'username', 'full_name', 'avatar']
  const react_attribute = ['userId', 'react_type', 'icon', 'commentId', 'postId']
  const comment_attribute = ['id', 'postId', 'isEdited', 'parentId', 'content', 'createdAt']
  const skip = (page - 1) * limit


  const { count, rows: comments } = await Comment.findAndCountAll({
    where: {
      postId: req.params.postId,
      parentId: null
    },
    offset: skip,
    limit: limit,
    order: [['createdAt', 'DESC']],
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
  });

  const formatData = formatComments(comments, req.user.id)

  return res.json(
    new ApiResponse(200, {
      comments: formatData,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }, 'Comment fetching')
  )
})
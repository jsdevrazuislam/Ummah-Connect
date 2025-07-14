import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import asyncHandler from "@/utils/async-handler";
import { Request, Response } from "express";
import { Post, Comment, User, Follow } from "@/models";
import CommentReaction from "@/models/react.models";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import { USER_ATTRIBUTE } from "@/constants";
import { getCommentTotalReactionsCountLiteral, getCommentUserReactionLiteral, getFollowerCountLiteral, getFollowingCountLiteral, getIsFollowingLiteral } from "@/utils/sequelize-sub-query";

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
      },
    })

    const followerCount = await Follow.count({ where: { followingId: req.user.id } });
    const followingCount = await Follow.count({ where: { followerId: req.user.id } });

    const commentJSON = comment.toJSON();
    delete commentJSON.userId;

    const response = {
      ...commentJSON,
      user: {
        id: req.user.id,
        full_name: req.user.full_name,
        username: req.user.username,
        avatar: req.user.avatar,
        location: req.user?.location,
        bio: req.user?.bio,
        followers_count: followerCount,
        following_count: followingCount,
        isFollowing: false
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

  const [, updatedComment] = await Comment.update(
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

  emitSocketEvent({ req, roomId: `post_${comment.postId}`, event: SocketEventEnum.DELETE_COMMENT, payload: { ...comment.toJSON(), isReply: comment.parentId ? true : false, totalComments } })

  return res.json(
    new ApiResponse(200, totalComments, 'Comment delete success')
  )
})

export const comment_react = asyncHandler(async (req: Request, res: Response) => {
  const { react_type, icon, postId, parentId, isReply } = req.body;
  const commentId = req.params?.commentId;
  const userId = req.user?.id;

  if (!commentId || !react_type || !icon) {
    throw new ApiError(400, "Missing required fields");
  }

  const [reaction, created] = await CommentReaction.findOrCreate({
    where: { userId, commentId },
    defaults: { react_type, icon },
  });

  if (!created) {
    await reaction.update({ react_type, icon });
  }

  const commentWithStats = await Comment.findOne({
    where: { id: commentId },
    attributes: {
      include: [
        getCommentUserReactionLiteral(userId, '"Comment"'),
        getCommentTotalReactionsCountLiteral('"Comment"'),
      ],
    },
  });

  if (!commentWithStats) {
    throw new ApiError(404, "Comment not found");
  }

  const data = commentWithStats.toJSON();

  emitSocketEvent({
    req,
    roomId: `post_${postId}`,
    event: SocketEventEnum.COMMENT_REACT,
    payload: {
      data,
      postId: Number(postId),
      commentId: Number(commentId),
      parentId: Number(parentId),
      isReply: Boolean(isReply),
    },
  });

  return res.json(
    new ApiResponse(200, data, "React Successfully")
  );
});


export const get_comments = asyncHandler(async (req: Request, res: Response) => {

  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  const comment_attribute = ['id', 'postId', 'isEdited', 'parentId', 'content', 'createdAt']
  const skip = (page - 1) * limit
  const userId = req.user.id


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
        include: [
          {
            model: User,
            as: 'user',
            attributes: [
              ...USER_ATTRIBUTE,
              getFollowerCountLiteral('"user"."id"'),
              getFollowingCountLiteral('"user"."id"'),
              getIsFollowingLiteral(userId, '"user"."id"'),
            ]
          }
        ],
        attributes:{
          include:[
            ...comment_attribute,
            getCommentTotalReactionsCountLiteral('"Comment"'),
            getCommentUserReactionLiteral(userId, '"Comment"'),
          ]
        }
      },
      {
        model: User,
        as: 'user',
        attributes: [
          ...USER_ATTRIBUTE,
          getFollowerCountLiteral('"user"."id"'),
          getFollowingCountLiteral('"user"."id"'),
          getIsFollowingLiteral(userId, '"user"."id"'),
        ]
      },
    ],
    attributes: {
      include: [
        getCommentTotalReactionsCountLiteral('"Comment"'),
        getCommentUserReactionLiteral(userId, '"Comment"'),
      ]
    }
  });

  return res.json(
    new ApiResponse(200, {
      comments: comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }, 'Comment fetching')
  )
})
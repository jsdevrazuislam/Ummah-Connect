import type { Request, Response } from "express";

import { Op } from "sequelize";

import { USER_ATTRIBUTE } from "@/constants";
import { DELETE_POST_CACHE } from "@/controllers/post.controller";
import { DELETE_SHORT_CACHE } from "@/controllers/stream.controller";
import { Comment, Follow, Post, User } from "@/models";
import { NotificationType } from "@/models/notification.models";
import CommentReaction from "@/models/react.models";
import Short from "@/models/shorts.models";
import { emitSocketEvent, SocketEventEnum } from "@/socket";
import ApiError from "@/utils/api-error";
import ApiResponse from "@/utils/api-response";
import asyncHandler from "@/utils/async-handler";
import { createAndInvalidateNotification } from "@/utils/notification";
import { getCommentTotalReactionsCountLiteral, getCommentUserReactionLiteral, getFollowerCountLiteral, getFollowingCountLiteral, getIsFollowingLiteral } from "@/utils/sequelize-sub-query";

export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { content, type } = req.body;
    const userId = req.user.id;
    const postId = req.params.id;
    let receiverPostId = null;
    const isTypeShort = type === "short";

    if (isTypeShort) {
      const short = await Short.findOne({ where: { id: postId } });
      receiverPostId = short?.userId;
      if (!short)
        throw new ApiError(404, "Short not found");
    }
    else {
      const post = await Post.findOne({ where: { id: postId } });
      receiverPostId = post?.authorId;
      if (!post)
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({ content, userId, ...(isTypeShort ? { shortId: postId } : { postId }) });

    const followerCount = await Follow.count({ where: { followingId: userId } });
    const followingCount = await Follow.count({ where: { followerId: userId } });
    const receiverId = Number(receiverPostId);

    if (userId !== receiverId) {
      const mentionUsernames = content?.match(/@(\w+)/g)?.map((tag: string) => tag.substring(1)) || [];

      if (mentionUsernames?.length > 0) {
        const mentionedUsers = await User.findAll({
          where: {
            username: { [Op.in]: mentionUsernames },
          },
        });

        for (const user of mentionedUsers) {
          await createAndInvalidateNotification({
            req,
            senderId: userId,
            receiverId: user.id,
            type: NotificationType.MENTION,
            message: comment.content,
            postId: comment.id || null,
          });
        }
      }
      else {
        await createAndInvalidateNotification({
          req,
          senderId: userId,
          receiverId,
          type: NotificationType.COMMENT,
          message: comment.content,
          postId: comment.id || null,
        });
      }
    }

    const commentJSON = comment.toJSON();
    delete commentJSON.userId;

    const response = {
      ...commentJSON,
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        username: req.user.username,
        avatar: req.user.avatar,
        location: req.user?.location,
        bio: req.user?.bio,
        followersCount: followerCount,
        followingCount,
        isFollowing: false,
      },
      totalCommentsCount: 0,
      totalReactionsCount: 0,
      currentUserReaction: null,
    };

    if (!isTypeShort)
      emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.CREATE_COMMENT, payload: { data: response } });

    if (isTypeShort) {
      await DELETE_SHORT_CACHE();
      emitSocketEvent({ req, roomId: `short_${postId}`, event: SocketEventEnum.CREATE_SHORT_COMMENT, payload: { data: response } });
    }

    return res.json(
      new ApiResponse(
        200,
        response,
        "Comment Created",
      ),
    );
  },
);

export const createReplyComment = asyncHandler(async (req: Request, res: Response) => {
  const { content, postId, type } = req.body;
  const userId = req.user.id;
  const isTypeShort = type === "short";
  const parentId = Number(req.params.id);
  let receiverPostId = null;

  if (isTypeShort) {
    const short = await Short.findOne({ where: { id: postId } });
    receiverPostId = short?.userId;
    if (!short)
      throw new ApiError(404, "Short not found");
  }
  else {
    const post = await Post.findOne({ where: { id: postId } });
    receiverPostId = post?.authorId;
    if (!post)
      throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({ content, userId, ...(isTypeShort ? { shortId: postId } : { postId }), parentId });

  const receiverId = Number(receiverPostId);

  if (userId !== receiverId) {
    const mentionUsernames = content?.match(/@(\w+)/g)?.map((tag: string) => tag.substring(1)) || [];
    if (mentionUsernames?.length > 0) {
      const mentionedUsers = await User.findAll({
        where: {
          username: { [Op.in]: mentionUsernames },
        },
      });

      for (const user of mentionedUsers) {
        await createAndInvalidateNotification({
          req,
          senderId: userId,
          receiverId: user.id,
          type: NotificationType.MENTION,
          message: comment.content,
          postId: comment.id || null,
        });
      }
    }
    else {
      await createAndInvalidateNotification({
        req,
        senderId: userId,
        receiverId,
        type: NotificationType.REPLY,
        message: comment.content,
        postId: comment.id || null,
      });
    }
  }

  const response = {
    ...comment.toJSON(),
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      username: req.user.username,
      avatar: req.user.avatar,
    },
    parentId,
    createdAt: comment.createdAt,
    totalReactionsCount: "0",
    currentUserReaction: null,
  };

  if (isTypeShort) {
    emitSocketEvent({ req, roomId: `short_${postId}`, event: SocketEventEnum.SHORT_REPLY_COMMENT, payload: { data: response } });
    await DELETE_SHORT_CACHE();
  }
  else {
    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.REPLY_COMMENT, payload: { data: response } });
  }

  return res.json(
    new ApiResponse(
      200,
      response,
      "Comment Created",
    ),
  );
});

export const editComment = asyncHandler(async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { postId, content, isReply, type } = req.body;
  const isTypeShort = type === "short";

  const comment = await Comment.findOne({ where: { id: commentId, ...(isTypeShort ? { shortId: postId } : { postId }), userId } });
  if (!comment)
    throw new ApiError(400, "You are not eligible edit this comment");

  const [, updatedComment] = await Comment.update(
    { content, isEdited: true },
    { where: { id: commentId }, returning: true },
  );

  const response = {
    content: updatedComment[0].content,
    id: updatedComment[0].id,
    isEdited: updatedComment[0].isEdited,
    parentId: updatedComment[0].parentId,
    postId: Number(postId),
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      avatar: req.user.avatar,
      username: req.user.username,
    },
    isReply,
  };

  if (isTypeShort) {
    await DELETE_SHORT_CACHE();
    emitSocketEvent({ req, roomId: `short_${postId}`, event: SocketEventEnum.SHORT_EDITED_COMMENT, payload: response });
  }
  else {
    emitSocketEvent({ req, roomId: `post_${postId}`, event: SocketEventEnum.EDITED_COMMENT, payload: response });
  }

  return res.json(new ApiResponse(200, response, "Updated comment"));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const comment = await Comment.findOne({ where: { id: commentId, userId } });
  if (!comment)
    throw new ApiError(400, "You are not eligible to delete this comment");

  await Comment.destroy({
    where: {
      id: commentId,
    },
  });

  const totalComments = await Comment.count({
    where: {
      ...(comment.shortId ? { shortId: comment.shortId } : { postId: comment.postId }),
    },
  });

  if (comment.shortId) {
    await DELETE_SHORT_CACHE();
    emitSocketEvent({ req, roomId: `short_${comment.shortId}`, event: SocketEventEnum.SHORT_DELETE_COMMENT, payload: { ...comment.toJSON(), isReply: !!comment.parentId, totalComments } });
  }
  else {
    emitSocketEvent({ req, roomId: `post_${comment.postId}`, event: SocketEventEnum.DELETE_COMMENT, payload: { ...comment.toJSON(), isReply: !!comment.parentId, totalComments } });
    await DELETE_POST_CACHE();
  }

  return res.json(
    new ApiResponse(200, totalComments, "Comment delete success"),
  );
});

export const commentReact = asyncHandler(async (req: Request, res: Response) => {
  const { reactType, icon, parentId, isReply } = req.body;
  const commentId = req.params?.commentId;
  const userId = req.user?.id;

  if (!commentId || !reactType || !icon) {
    throw new ApiError(400, "Missing required fields");
  }

  const [reaction, created] = await CommentReaction.findOrCreate({
    where: { userId, commentId },
    defaults: { reactType, icon },
  });

  if (!created) {
    await reaction.update({ reactType, icon });
  }

  const commentWithStats = await Comment.findOne({
    where: { id: commentId },
    attributes: {
      include: [
        getCommentUserReactionLiteral(userId, "\"Comment\""),
        getCommentTotalReactionsCountLiteral("\"Comment\""),
      ],
    },
  });

  if (!commentWithStats) {
    throw new ApiError(404, "Comment not found");
  }

  const data = commentWithStats.toJSON();
  const postId = commentWithStats.postId ? commentWithStats.postId : commentWithStats.shortId;

  if (commentWithStats.postId) {
    emitSocketEvent({
      req,
      roomId: `post_${postId}`,
      event: SocketEventEnum.COMMENT_REACT,
      payload: {
        data,
        postId,
        commentId: Number(commentId),
        parentId: Number(parentId),
        isReply: Boolean(isReply),
      },
    });
  }
  else {
    emitSocketEvent({
      req,
      roomId: `short_${postId}`,
      event: SocketEventEnum.COMMENT_REACT,
      payload: {
        data,
        postId,
        commentId: Number(commentId),
        parentId: Number(parentId),
        isReply: Boolean(isReply),
      },
    });
    await DELETE_SHORT_CACHE();
  }

  return res.json(
    new ApiResponse(200, data, "React Successfully"),
  );
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page as string);
  const limit = Number(req.query.limit as string);
  const isTypeShort = req.query.type === "short";
  const commentAttribute = ["id", "postId", "isEdited", "parentId", "content", "createdAt"];
  const skip = (page - 1) * limit;
  const userId = req.user.id;

  const { count, rows: comments } = await Comment.findAndCountAll({
    where: {
      ...(isTypeShort ? { shortId: req.params.postId } : { postId: req.params.postId }),
      parentId: null,
    },
    offset: skip,
    limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Comment,
        as: "replies",
        required: false,
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              ...USER_ATTRIBUTE,
              getFollowerCountLiteral("\"user\".\"id\""),
              getFollowingCountLiteral("\"user\".\"id\""),
              getIsFollowingLiteral(userId, "\"user\".\"id\""),
            ],
          },
        ],
        attributes: {
          include: [
            ...commentAttribute,
            getCommentTotalReactionsCountLiteral("\"Comment\""),
            getCommentUserReactionLiteral(userId, "\"Comment\""),
          ],
        },
      },
      {
        model: User,
        as: "user",
        attributes: [
          ...USER_ATTRIBUTE,
          getFollowerCountLiteral("\"user\".\"id\""),
          getFollowingCountLiteral("\"user\".\"id\""),
          getIsFollowingLiteral(userId, "\"user\".\"id\""),
        ],
      },
    ],
    attributes: {
      include: [
        getCommentTotalReactionsCountLiteral("\"Comment\""),
        getCommentUserReactionLiteral(userId, "\"Comment\""),
      ],
    },
  });

  return res.json(
    new ApiResponse(200, {
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    }, "Comment fetching"),
  );
});

import type { Literal } from "sequelize/types/utils";

import sequelize from "@/config/db";

/**
 * Returns a Sequelize literal for counting followers of a user.
 * @param targetUserIdSqlColumn The SQL reference to the user's ID column (e.g., '"user"."id"' or '"Post"."authorId"').
 * @returns [sequelize.literal, string]
 */
export function getFollowerCountLiteral(targetUserIdSqlColumn: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT COUNT(*)
      FROM "follows" AS "Follow"
      WHERE "Follow"."followingId" = ${targetUserIdSqlColumn}
    )`),
    "followersCount",
  ];
}

/**
 * Returns a Sequelize literal for counting users followed by a user.
 * @param targetUserIdSqlColumn The SQL reference to the user's ID column (e.g., '"user"."id"' or '"Post"."authorId"').
 * @returns [sequelize.literal, string]
 */
export function getFollowingCountLiteral(targetUserIdSqlColumn: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT COUNT(*)
      FROM "follows" AS "Follow"
      WHERE "Follow"."followerId" = ${targetUserIdSqlColumn}
    )`),
    "followingCount",
  ];
}

/**
 * Returns a Sequelize literal to check if the current user is following another user.
 * @param currentUserId The ID of the currently authenticated user.
 * @param targetUserIdSqlColumn The SQL reference to the user's ID column being checked (e.g., '"user"."id"' or '"Post"."authorId"').
 * @returns [sequelize.literal, string]
 */
export function getIsFollowingLiteral(currentUserId: number | undefined, targetUserIdSqlColumn: string): [Literal, string] {
  const followerIdValue = currentUserId !== undefined && currentUserId !== null ? currentUserId : "NULL";

  return [
    sequelize.literal(`(
      SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END
      FROM "follows" AS "Follow"
      WHERE "Follow"."followerId" = ${followerIdValue} AND "Follow"."followingId" = ${targetUserIdSqlColumn}
    )`),
    "isFollowing",
  ];
}

/**
 * Generates a Sequelize literal to count the total number of comments for a given post.
 * This literal can be used in a Sequelize query to select the comment count directly from the database.
 *
 * @param {string} postAlias - The alias used for the post table in the Sequelize query (e.g., 'post', 'p').
 * @returns {[Literal, string]} A tuple where the first element is a Sequelize literal for the comment count,
 * and the second element is the desired alias for the counted column ('totalCommentsCount').
 *
 * @example
 * // In a Sequelize query:
 * const [totalCommentsLiteral, totalCommentsAlias] = getTotalCommentsCountLiteral('Post');
 * Post.findAll({
 * attributes: [
 * 'id',
 * 'title',
 * [totalCommentsLiteral, totalCommentsAlias]
 * ]
 * });
 */
export function getTotalCommentsCountLiteral(postAlias: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT COUNT(*) FROM "comments" AS c
      WHERE c."postId" = ${postAlias}.id
    )`),
    "totalCommentsCount",
  ];
}

/**
 * Generates a Sequelize literal to count the total number of reactions for a given post.
 * This literal can be used in a Sequelize query to select the reaction count directly from the database.
 *
 * @param {string} postAlias - The alias used for the post table in the Sequelize query (e.g., 'post', 'p').
 * @returns {[Literal, string]} A tuple where the first element is a Sequelize literal for the reaction count,
 * and the second element is the desired alias for the counted column ('totalReactionsCount').
 *
 * @example
 * // In a Sequelize query:
 * const [totalReactionsLiteral, totalReactionsAlias] = getTotalReactionsCountLiteral('Post');
 * Post.findAll({
 * attributes: [
 * 'id',
 * 'title',
 * [totalReactionsLiteral, totalReactionsAlias]
 * ]
 * });
 */
export function getTotalReactionsCountLiteral(postAlias: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT COUNT(*) FROM "reactions" AS r
      WHERE r."postId" = ${postAlias}.id
    )`),
    "totalReactionsCount",
  ];
}

export function getIsBookmarkedLiteral(currentUserId: number, alias: string): [Literal, string] {
  return [
    sequelize.literal(`EXISTS (
      SELECT 1 FROM "bookmarks_posts" AS b
      WHERE b."postId" = ${alias}.id AND b."userId" = ${currentUserId}
    )`),
    "isBookmarked",
  ];
}

export function getUserReactionLiteral(currentUserId: number, alias: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT r."reactType"
      FROM "reactions" AS r
      WHERE r."postId" = ${alias}.id AND r."userId" = ${currentUserId}
      LIMIT 1
    )`),
    "currentUserReaction",
  ];
}

export function getCommentUserReactionLiteral(userId: number, alias: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT r."reactType"
      FROM "reactions" AS r
      WHERE r."commentId" = ${alias}.id AND r."userId" = ${userId}
      LIMIT 1
    )`),
    "currentUserReaction",
  ];
}

export function getCommentTotalReactionsCountLiteral(alias: string): [Literal, string] {
  return [
    sequelize.literal(`(
      SELECT COUNT(*) FROM "reactions" AS r
      WHERE r."commentId" = ${alias}.id
    )`),
    "totalReactionsCount",
  ];
}

import type { NextFunction, Request, Response } from "express";

/**
 * @typedef {function(Request, Response, NextFunction): void} AsyncRequestHandler
 * A type definition for an Express.js asynchronous request handler that does not explicitly return a Promise
 * but is intended to be wrapped by `asyncHandler`. The wrapped function is expected to perform
 * asynchronous operations.
 */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Wraps an asynchronous Express.js request handler to automatically catch any errors
 * that occur within it and pass them to the Express error handling middleware.
 * This prevents unhandled promise rejections from crashing the server.
 *
 * This utility is particularly useful for Express.js versions prior to v5 where
 * asynchronous errors are not automatically forwarded to `next()`.
 *
 * @param {AsyncRequestHandler} func - The asynchronous Express request handler function to wrap.
 * It should accept `(req, res, next)` as arguments.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} A new request handler function that,
 * when called, executes the original `func` and catches any rejected promises,
 * passing the error to the `next` middleware.
 *
 * @example
 * // In your controller:
 * import asyncHandler from './utils/asyncHandler'; // Adjust path as needed
 * import ApiError from './utils/api-error'; // Your custom error class
 *
 * export const getUserProfile = asyncHandler(async (req, res, next) => {
 * const user = await User.findById(req.params.id);
 * if (!user) {
 * throw new ApiError(404, "User not found");
 * }
 * res.json(user);
 * });
 *
 * @example
 * // In your route definition:
 * import express from 'express';
 * import { getUserProfile } from '../controllers/userController';
 *
 * const router = express.Router();
 * router.get('/profile/:id', getUserProfile);
 * export default router;
 */
function asyncHandler(func: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure the function's return value (a Promise) is handled.
    // If the promise rejects, the error is caught and passed to the next error middleware.
    Promise.resolve(func(req, res, next)).catch(error => next(error));
  };
}

export default asyncHandler;

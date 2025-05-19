import { NextFunction, Request, Response } from "express";

const asyncHandler = (func: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch((error) => next(error));
  };
};


export default asyncHandler

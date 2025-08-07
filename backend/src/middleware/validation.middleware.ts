import type { NextFunction, Request, Response } from "express";
import type { z, ZodIssue } from "zod";

import { ZodError } from "zod";

/**
 * Middleware to validate request body against a Zod schema.
 * @template T The inferred type of the data being validated by the schema.
 * @param schema The Zod schema to validate the request body against.
 * @returns An Express middleware function.
 */
export function validateData<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    }
    catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: ZodIssue) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      }
      else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

import type { User } from "@/types/auth";

type UploadedFiles = {
  cover?: Express.Multer.File[];
  avatar?: Express.Multer.File[];
};

declare global {
  namespace Express {
    // eslint-disable-next-line ts/consistent-type-definitions
    interface Request {
      user: User;
    }
  }

  namespace Multer {
    type FieldStorage = {
      files?: UploadedFiles;
    };
  }
}

export {};

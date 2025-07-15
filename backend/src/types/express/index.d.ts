import { User } from "@/types/auth";

interface UploadedFiles {
  cover?: Express.Multer.File[];
  avatar?: Express.Multer.File[];
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }

  namespace Multer{
    interface FieldStorage {
      files?: UploadedFiles;
    }
  }
}



export {}
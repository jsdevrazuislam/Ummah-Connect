import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "@/utils/ApiError";
import { extractPublicId } from 'cloudinary-build-url'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileOnCloudinary = async (localFilePath: string, folderName:string) => {
  try {
    if (!localFilePath)
      return {
        message: "File not found",
      };
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderName
    });

    console.log(`File is uploaded on cloudinary ${res.url}`);
    fs.unlinkSync(localFilePath);
    return res.url;
  } catch (error) {
    console.log(`File Upload Error`, error);
    fs.unlinkSync(localFilePath); 
  }
};

export const removeOldImageOnCloudinary = async (url: string) => {
  try {
    if (!url)
      return {
        message: "PublicId not found",
      };
      await cloudinary.uploader.destroy(extractPublicId(url), {
        resource_type: "image",
      });
    console.log(
      `Image with publicId ${extractPublicId(url)} deleted successfully`
    );
  } catch (error) {
    console.error("Error deleting old image:", error);
    throw new ApiError(
      500,
      "Something went wrong while delete cloudinary file"
    );
  }
};
export const removeOldVideoOnCloudinary = async (url: string) => {
  try {
    if (!url)
      return {
        message: "PublicId not found",
      };
    await cloudinary.uploader.destroy(extractPublicId(url), {
      resource_type: "video",
    });
    console.log(
      `Video with publicId ${extractPublicId(url)} deleted successfully`
    );
  } catch (error) {
    console.error("Error deleting old video:", error);
    throw new ApiError(
      500,
      "Something went wrong while delete cloudinary video file"
    );
  }
};

export default uploadFileOnCloudinary;

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "@/utils/ApiError";
import { extractPublicId } from 'cloudinary-build-url'
import { getFileType } from "@/utils/helper";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadFileOnCloudinary = async (localFilePath: string, folderName: string) => {
  try {
    if (!localFilePath)
      return {
        message: "File not found",
      };
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderName,
      media_metadata: true
    });

    console.log(`File is uploaded on cloudinary ${res.url}`);
    fs.unlinkSync(localFilePath);
    return {
      url: res.url,
      duration: res?.duration
    };
  } catch (error) {
    console.log(`File Upload Error`, error);
    fs.unlinkSync(localFilePath);
  }
};

export const getThumbnailFromVideo = (videoUrl: string, type: string) => {

  if (!videoUrl) return null;
  if (!getFileType(type).includes('video')) return null;

  const urlParts = videoUrl.split('/');
  const publicIdWithExtension = urlParts.slice(urlParts.indexOf('upload') + 1).join('/');
  const publicId = publicIdWithExtension.split('.')[0];

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/w_300,h_200,c_thumb,q_auto,f_jpg/${publicId}.png`
}

export const removeOldImageOnCloudinary = async (url: string) => {
  try {
    if (!url)
      return {
        message: "PublicId not found",
      };
    await cloudinary.uploader.destroy(extractPublicId(url), {
      resource_type: "auto",
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

export default cloudinary;

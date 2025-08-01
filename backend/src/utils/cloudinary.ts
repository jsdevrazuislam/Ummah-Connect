/* eslint-disable camelcase */
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import fs from "node:fs";

import ApiError from "@/utils/api-error";
import { getFileType } from "@/utils/helper";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFileOnCloudinary(localFilePath: string, folderName: string, type?: string) {
  try {
    if (!localFilePath) {
      return {
        message: "File not found",
      };
    }
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderName,
      media_metadata: true,
    });

    fs.unlinkSync(localFilePath);
    return {
      url: res.resource_type === "image" ? res.url : !getFileType(type ?? "").includes("video") ? res.url : res.public_id,
      duration: res?.duration,
      resource_type: res.resource_type,
    };
  }
  catch {
    fs.unlinkSync(localFilePath);
    throw new ApiError(
      500,
      "Something went wrong while delete cloudinary file",
    );
  }
}

export function getThumbnailFromVideo(videoUrl: string, type: string) {
  if (!videoUrl)
    return null;
  if (!getFileType(type).includes("video"))
    return null;

  const urlParts = videoUrl.split("/");
  const publicIdWithExtension = urlParts.slice(urlParts.indexOf("upload") + 1).join("/");
  const publicId = publicIdWithExtension.split(".")[0];

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/w_300,h_200,c_thumb,q_auto,f_jpg/${publicId}.png`;
}

export async function removeOldImageOnCloudinary(url: string) {
  try {
    if (!url) {
      return {
        message: "PublicId not found",
      };
    }
    await cloudinary.uploader.destroy(extractPublicId(url), {
      resource_type: "auto",
    });
  }
  catch {
    throw new ApiError(
      500,
      "Something went wrong while delete cloudinary file",
    );
  }
}

export default cloudinary;

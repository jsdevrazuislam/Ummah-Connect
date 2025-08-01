import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function to12HourFormat(time: string): string {
  const [hourStr, minute] = time.split(":");
  let hour = Number.parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export function validateEmail(email: string) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i,
    );
}

export function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function parseFormattedTime(timeStr: string): number {
  const parts = timeStr.split(":").map(Number).reverse();
  return parts.reduce((acc, val, i) => acc + val * 60 ** i, 0);
}

/**
 * Determines the general file type based on its MIME type.
 *
 * @param {string} mimetype - The MIME type string of the file (e.g., 'image/jpeg', 'video/mp4', 'application/pdf').
 * @returns {'image' | 'video' | 'audio' | 'pdf' | 'other'} A string representing the determined file type.
 */
export function getFileType(mimetype: string): "image" | "video" | "audio" | "pdf" | "other" {
  if (mimetype.startsWith("image/"))
    return "image";
  if (mimetype.startsWith("video/"))
    return "video";
  if (mimetype.startsWith("audio/"))
    return "audio";
  if (mimetype === "application/pdf")
    return "pdf";
  return "other";
}

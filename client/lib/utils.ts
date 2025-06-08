import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatTimeAgo(date: Date, isShort = false): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} ${isShort ? 's' : 'seconds ago'}`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${isShort ? 'm' : 'minutes ago'}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${isShort ? 'h' : 'hours ago'}`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${isShort ? 'd' : 'days ago'}`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} ${isShort ? 'w' : 'weeks ago'}`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} ${isShort ? 'mon' : 'months ago'}`;
  return `${Math.floor(seconds / 31536000)} ${isShort ? 'y' : 'years ago'}`;
}


export const validateEmail = (email:string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const parseFormattedTime = (formatted: string): number => {
  const [minutes, seconds] = formatted.split(":").map(Number);
  return (minutes * 60) + seconds;
};

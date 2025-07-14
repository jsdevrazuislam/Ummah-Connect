import path from 'path';

export const getFileTypeFromPath = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  if (['.mp4', '.mkv', '.mov', '.webm'].includes(ext)) return 'video/mp4';
  if (['.mp3', '.wav', '.aac'].includes(ext)) return 'audio/mpeg';
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return 'image/jpeg';
  return 'text/plain';
};

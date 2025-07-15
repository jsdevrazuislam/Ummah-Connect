import { cn } from "@/lib/utils"
import HlsVideoPlayer from "@/components/hsl-video-player"
import Image from "next/image"

export const PostMedia = ({ 
  media, 
  contentType,
  altText = "Post media",
  className = "",
  poster
}: {
  media: string | undefined
  contentType: 'picture' | 'video' | 'text' | 'audio' | undefined
  altText?: string
  className?: string
  poster?: string
}) => {
  if (!media) return null

  if (contentType === 'picture') {
    return (
      <div className={cn("rounded-lg overflow-hidden border border-border", className)}>
        <Image
          src={media || "/placeholder.svg"}
          alt={altText}
          width={800}
          height={400}
          className="w-full h-full object-cover"
          priority={false}
        />
      </div>
    )
  }

  if (contentType === 'video') {
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        <HlsVideoPlayer 
          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/sp_auto/v1751778607/${media}.m3u8`}
          poster={poster}
          className="w-full max-w-full"
        />
      </div>
    )
  }

  return null
}
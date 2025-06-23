'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ShortsControls from '@/app/(dashboard)/shorts/[id]/shorts-controls'
import { Heart, MessageCircle, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const shortsData = [
  {
    id: '5',
    videoUrl: 'https://res.cloudinary.com/dqh3uisur/video/upload/v1750659535/ummah_connect/shorts/2025-06-23_12-17-47_otwbrw.mp4',
    creator: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    title: 'Amazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beach',
    likes: 1243,
    comments: 243,
    shares: 56
  },
  {
    id: '1',
    videoUrl: 'https://res.cloudinary.com/dqh3uisur/video/upload/v1750648237/ummah_connect/shorts/13788211_2048_1080_30fps_o7ab7y.mp4',
    creator: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    title: 'Amazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beach',
    likes: 1243,
    comments: 243,
    shares: 56
  },
  {
    id: '2',
    videoUrl: 'https://res.cloudinary.com/dqh3uisur/video/upload/v1750648237/ummah_connect/shorts/13137663_1080_1920_30fps_kyer2f.mp4',
    creator: {
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg'
    },
    title: 'My new cooking recipe tutorial',
    likes: 3421,
    comments: 421,
    shares: 89
  },
]

export function ShortsPlayer({ shortId }: { shortId: string }) {
  const router = useRouter()
  const params = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [currentShort, setCurrentShort] = useState(() =>
    shortsData.find(short => short.id === shortId) || shortsData[0]
  )
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isInteracting, setIsInteracting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleTextRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (titleTextRef.current && titleContainerRef.current) {
      const isOverflowing =
        titleTextRef.current.scrollHeight > titleContainerRef.current.clientHeight ||
        titleTextRef.current.scrollWidth > titleContainerRef.current.clientWidth
      setIsOverflowing(isOverflowing)
    }
  }, [shortId, expanded])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    video.play().catch(e => console.error("Video play failed:", e))

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [currentShort])

  useEffect(() => {
    const newShort = shortsData.find(short => short.id === params.id)
    if (newShort && newShort.id !== currentShort.id) {
      setCurrentShort(newShort)
    }
  }, [params.id, currentShort.id])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let startY: number
    let isScrolling = false

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isInteracting) return

      const y = e.touches[0].clientY
      const diff = startY - y

      if (Math.abs(diff) > 50 && !isScrolling) {
        isScrolling = true

        const currentIndex = shortsData.findIndex(s => s.id === currentShort.id)
        if (diff > 0 && currentIndex < shortsData.length - 1) {
          router.push(`/shorts/${shortsData[currentIndex + 1].id}`)
        } else if (diff < 0 && currentIndex > 0) {
          router.push(`/shorts/${shortsData[currentIndex - 1].id}`)
        }

        setTimeout(() => {
          isScrolling = false
        }, 500)
      }
    }

    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [currentShort.id, isInteracting, router])


  const navigateShort = (direction: 'next' | 'prev') => {
    const currentIndex = shortsData.findIndex(s => s.id === currentShort.id)
    if (direction === 'next' && currentIndex < shortsData.length - 1) {
      router.push(`/shorts/${shortsData[currentIndex + 1].id}`)
    } else if (direction === 'prev' && currentIndex > 0) {
      router.push(`/shorts/${shortsData[currentIndex - 1].id}`)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto max-w-[350px] h-[calc(100vh-96px)] overflow-hidden bg-black rounded-xl"
    >
      <video
        ref={videoRef}
        src={currentShort.videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        autoPlay
        playsInline
      />

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute z-30 bottom-4 left-4 right-16">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-8 w-8 border border-white">
            <AvatarImage src={currentShort.creator.avatar} />
            <AvatarFallback>{currentShort.creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-white">{currentShort.creator.name}</span>
        </div>

        {/* Title container with scroll */}
        <div className="relative">
          <div
            ref={titleContainerRef}
            className={`text-white text-sm mb-1 pr-2 ${expanded ? 'max-h-[80px] overflow-y-auto' : 'max-h-[40px] overflow-hidden'
              }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#ffffff30 transparent',
            }}
          >
            <p ref={titleTextRef}>{currentShort.title}</p>
          </div>

          {/* See More/Less button */}
          {isOverflowing && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-white text-xs font-medium hover:underline focus:outline-none mt-1"
            >
              {expanded ? 'Show Less' : 'See More'}
            </button>
          )}
        </div>

        <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
      `}</style>
      </div>

      <div
        className="absolute right-4 bottom-20 flex flex-col items-center space-y-5"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
      >
        <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
            <Heart className="h-5 w-5" />
          </Button>
          <span className="text-white text-xs mt-1">{currentShort.likes}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <span className="text-white text-xs mt-1">{currentShort.comments}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
            <Share2 className="h-5 w-5" />
          </Button>
          <span className="text-white text-xs mt-1">{currentShort.shares}</span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-between px-2">
        <button
          onClick={() => navigateShort('prev')}
          className="w-1/3 h-full flex items-center justify-start"
          aria-label="Previous short"
        >
          <div className="bg-black/50 rounded-full p-2">
            <ChevronLeft />
          </div>
        </button>
        <button
          onClick={() => navigateShort('next')}
          className="w-1/3 h-full flex items-center justify-end"
          aria-label="Next short"
        >
          <div className="bg-black/50 rounded-full p-2">
            <ChevronRight />
          </div>
        </button>
      </div>

      <ShortsControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
        onMuteUnmute={() => {
          if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
          }
        }}
      />
    </div>
  )
}
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ShortsControls from '@/app/(dashboard)/shorts/[id]/shorts-controls'
import {
  Heart, MessageCircle, Share2,
  Facebook,
  Twitter,
  Link,
  Mail,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'


const shortsData = [
  {
    id: '1',
    videoUrl: 'https://res.cloudinary.com/dqh3uisur/video/upload/v1750659535/ummah_connect/shorts/2025-06-23_12-17-47_otwbrw.mp4',
    creator: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    title: 'Amazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view',
    likes: 1243,
    comments: 243,
    shares: 56
  },
  {
    id: '2',
    videoUrl: 'https://res.cloudinary.com/dqh3uisur/video/upload/v1750659535/ummah_connect/shorts/2025-06-23_12-17-47_otwbrw.mp4',
    creator: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    title: 'Amazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view at the beach Amazing sunset view at the beachAmazing sunset view',
    likes: 1243,
    comments: 243,
    shares: 56
  }
]

export function ShortsPlayer({ shortId }: { shortId: string }) {
  const router = useRouter()
  const params = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)


  const [currentShort, setCurrentShort] = useState(() =>
    shortsData.find(short => short.id === shortId) || shortsData[0]
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleTextRef = useRef<HTMLParagraphElement>(null)
  const [showComments, setShowComments] = useState(false)

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    setIsSeeking(true)
  }

  const handleSliderCommit = (value: number[]) => {
    const newTime = value[0]
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
    setIsSeeking(false)
  }

  const shareToPlatform = (platform: string) => {
    const shareUrl = window.location.href
    const title = currentShort.title
    const text = `Check out this short: ${title}`

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        break
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${shareUrl}`)}`)
        break
      default:
        break
    }
    setIsShareModalOpen(false)
  }

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
    <div className='relative'>
      <div
        ref={containerRef}
        className="relative mx-auto mt-4 max-w-[350px] h-[calc(100vh-96px)] overflow-hidden bg-black rounded-xl"
      >
        <video
          ref={videoRef}
          src={currentShort.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          autoPlay
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
        />

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute z-30 bottom-20 left-4 right-16">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentShort.creator.avatar} />
              <AvatarFallback>{currentShort.creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-white">{currentShort.creator.name}</span>
          </div>

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

        <div className="absolute bottom-3 left-0 right-0 px-4">
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={[currentTime]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            className="flex-1"
            trackClassName='h-1'
            thumbClassName='hidden'
            rangeClassName='!bg-primary'
          />
        </div>
        {showComments && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Comments 40</h3>
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowComments(false)}>
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {
                [...Array(100)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">user123</span>
                        <span className="text-white/50 text-xs">2h ago</span>
                      </div>
                      <p className="text-white text-sm mt-1">MashaAllah, beautiful architecture!</p>
                    </div>
                  </div>
                ))
              }

            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Your avatar" />
                  <AvatarFallback>YA</AvatarFallback>
                </Avatar>
                <Input
                  placeholder="Add a comment..."
                  className="bg-white/10 border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button size="sm">Post</Button>
              </div>
            </div>
          </div>
        )}


      </div>
      <div className="absolute top-[30%] right-[5%] flex flex-col gap-4">
        <button
          onClick={() => navigateShort('prev')}
          aria-label="Previous short"
        >
          <div className="bg-white/10 rounded-full p-2">
            <ArrowUp />
          </div>
        </button>
        <button
          onClick={() => navigateShort('next')}
          aria-label="Next short"
        >
          <div className="bg-white/10 rounded-full p-2">
            <ArrowDown />
          </div>
        </button>
      </div>
      <div
        className="absolute z-30 right-[33%] bottom-20 flex flex-col items-center space-y-5"
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
          <Button onClick={() => setShowComments(!showComments)} variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <span className="text-white text-xs mt-1">{currentShort.comments}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button onClick={() => setIsShareModalOpen(true)} variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
            <Share2 className="h-5 w-5" />
          </Button>
          <span className="text-white text-xs mt-1">{currentShort.shares}</span>
        </div>
      </div>
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Share this short</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 py-4">
            <button
              onClick={() => shareToPlatform('facebook')}
              className="flex flex-col items-center space-y-2 text-white hover:text-blue-400 transition-colors"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Facebook className="h-6 w-6" />
              </div>
              <span className="text-xs">Facebook</span>
            </button>

            <button
              onClick={() => shareToPlatform('twitter')}
              className="flex flex-col items-center space-y-2 text-white hover:text-blue-400 transition-colors"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Twitter className="h-6 w-6" />
              </div>
              <span className="text-xs">Twitter</span>
            </button>

            {/* <button 
              onClick={() => shareToPlatform('whatsapp')}
              className="flex flex-col items-center space-y-2 text-white hover:text-green-400 transition-colors"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Whatsapp className="h-6 w-6" />
              </div>
              <span className="text-xs">WhatsApp</span>
            </button>
             */}
            <button
              onClick={() => shareToPlatform('copy')}
              className="flex flex-col items-center space-y-2 text-white hover:text-purple-400 transition-colors"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Link className="h-6 w-6" />
              </div>
              <span className="text-xs">Copy Link</span>
            </button>
            <button
              onClick={() => shareToPlatform('email')}
              className="flex flex-col items-center space-y-2 text-white hover:text-red-400 transition-colors"
            >
              <div className="p-3 bg-gray-800 rounded-full">
                <Mail className="h-6 w-6" />
              </div>
              <span className="text-xs">Email</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
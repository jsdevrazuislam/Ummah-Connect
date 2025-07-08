'use client'

import { useEffect, useRef, useState } from 'react'
import ShortsControls from '@/app/(dashboard)/shorts/[id]/shorts-controls'
import {
    Heart, MessageCircle, Share2,
    Facebook,
    Link as LinkIcon,
    Mail,
    X,
    Phone,
    PlayIcon,
    PauseIcon
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import VideoPlayer, { VideoPlayerHandle } from '@/app/(dashboard)/shorts/[id]/player'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { react_post } from '@/lib/apis/posts'
import { toast } from 'sonner'
import { create_comment } from '@/lib/apis/comment'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface VideoShortsProps {
    currentShort: ShortsEntity | null | undefined
    currentShortIndex: number
    animationDirection: string
    navigateShort: (direction: "next" | "prev") => void
}



export default function ShortVideo({ currentShort, currentShortIndex, animationDirection }: VideoShortsProps) {
    const playerRef = useRef<VideoPlayerHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [isSeeking, setIsSeeking] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const titleContainerRef = useRef<HTMLDivElement>(null)
    const titleTextRef = useRef<HTMLParagraphElement>(null)
    const [showComments, setShowComments] = useState(false)
    const queryClient = useQueryClient()
    const [commentText, setCommentText] = useState("")
    const [liked, setLiked] = useState(false)
    const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);
    const [overlayIconType, setOverlayIconType] = useState<'play' | 'pause' | null>(null);
    const isThrottled = useRef(false);


    const { mutate } = useMutation({
        mutationFn: react_post,
        onSuccess: (updateData, variable) => {

        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: mnFun, isPending } = useMutation({
        mutationFn: create_comment,
        onSuccess: (newComment, variable) => {
            // queryClient.setQueryData(['get_comments', variable.postId], (oldData: QueryOldDataCommentsPayload) => {
            //   return addCommentToPost(oldData, variable.postId, newComment.data)
            // })
            // queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
            //   return incrementDecrementCommentCount(oldData, variable.postId, newComment?.data?.totalComments)
            // })
            setCommentText("")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })


    const handleSliderChange = (value: number[]) => {
        setCurrentTime(value[0]);
        setIsSeeking(true);
    }

    const handleSliderCommit = (value: number[]) => {
        playerRef.current?.seekTo(value[0]);
        setIsSeeking(false);
    }

    const shareToPlatform = (platform: string) => {
        const shareUrl = window.location.href
        const title = 'Test'
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
    }, [expanded, currentShort?.description])
    

    const handlePlayPauseClick = () => {
        const player = playerRef.current;
        if (player) {
            if (player.isPlaying()) {
                player.pause();
                setOverlayIconType('pause');
            } else {
                player.play();
                setOverlayIconType('play');
            }
            setShowPlayPauseOverlay(true);
            setTimeout(() => {
                setShowPlayPauseOverlay(false);
            }, 500);
        }
    };


    const handleLike = () => {
        const payload = {
            react_type: 'love',
            icon: '❤️',
            id: currentShort?.id ?? 0,
            type: 'short'
        }
        mutate(payload)
        setLiked(true)
    }


    const variants: Variants = {
        enter: (direction: 'next' | 'prev') => ({
            y: direction === 'next' ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: 'easeOut' },
        },
        exit: (direction: 'next' | 'prev') => ({
            y: direction === 'next' ? -1000 : 1000,
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeIn' },
        }),
    };



    return (
        <AnimatePresence initial={false} custom={animationDirection}>
            <motion.div
                key={currentShortIndex}
                custom={animationDirection}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
            >
                <div className='relative'>
                    <div
                        ref={containerRef}
                        className="relative mx-auto mt-4 max-w-[350px] h-[calc(100vh-96px)] overflow-hidden bg-black rounded-xl"
                    >
                        <VideoPlayer
                            ref={playerRef}
                            autoPlay
                            muted={isMuted}
                            onLoadedMetadata={(dur) => setDuration(dur)}
                            onTimeUpdate={(time) => {
                                if (!isSeeking) setCurrentTime(time);
                                if (playerRef.current?.isPlaying()) setIsPlaying(true);
                                else setIsPlaying(false);
                            }}
                            videoUrl={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/video/upload/sp_auto/v1751778607/${currentShort?.video_id}.m3u8`} />

                        <div className="absolute inset-0 z-10" onClick={handlePlayPauseClick}>
                            <AnimatePresence>
                                {showPlayPauseOverlay && (
                                    <motion.div
                                        key="overlay"
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="h-20 w-20 rounded-full drop-shadow-lg bg-black/70 flex justify-center items-center">
                                            {overlayIconType === 'play' && <PlayIcon className="text-white w-8 h-8" />}
                                            {overlayIconType === 'pause' && <PauseIcon className="text-white w-8 h-8" />}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

                        <div className="absolute z-30 bottom-8 left-4 right-16">
                            <Link href={`/profile/${currentShort?.user?.username}`} className="flex items-center space-x-2 mb-2 cursor-pointer">
                                <Avatar className="h-8 w-8">
                                    {currentShort?.user?.avatar && <AvatarImage src={currentShort?.user?.avatar} />}
                                    {!currentShort?.user?.avatar && <AvatarFallback>{currentShort?.user?.full_name?.charAt(0)}</AvatarFallback>}
                                </Avatar>
                                <span className="font-semibold text-white">{currentShort?.user?.full_name}</span>
                            </Link>

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
                                    <p className='short_description' ref={titleTextRef}>{currentShort?.description}</p>
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

                        </div>

                        <ShortsControls
                            isPlaying={isPlaying}
                            isMuted={isMuted}
                            onPlayPause={() => {
                                const player = playerRef.current;
                                if (player?.isPlaying()) player.pause();
                                else player?.play();
                            }}
                            onMuteUnmute={() => {
                                setIsMuted((prev) => !prev);
                                playerRef.current?.toggleMute();
                            }}
                            shortId={currentShort?.id}
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
                    <div className="absolute z-30 right-[33%] bottom-20 flex flex-col items-center space-y-5">
                        <div className="flex flex-col items-center">
                            <Button onClick={handleLike} variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                                <Heart className={cn("h-5 w-5", liked ? "fill-red-500 text-red-500" : "")} />
                            </Button>
                            <span className="text-white text-xs mt-1">{currentShort?.totalReactionsCount}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Button onClick={() => setShowComments(!showComments)} variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                            <span className="text-white text-xs mt-1">{currentShort?.totalCommentsCount}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Button onClick={() => setIsShareModalOpen(true)} variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <span className="text-white text-xs mt-1">{currentShort?.share}</span>
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
                                        <X className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs">Twitter</span>
                                </button>

                                <button
                                    onClick={() => shareToPlatform('whatsapp')}
                                    className="flex flex-col items-center space-y-2 text-white hover:text-green-400 transition-colors"
                                >
                                    <div className="p-3 bg-gray-800 rounded-full">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs">WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => shareToPlatform('copy')}
                                    className="flex flex-col items-center space-y-2 text-white hover:text-purple-400 transition-colors"
                                >
                                    <div className="p-3 bg-gray-800 rounded-full">
                                        <LinkIcon className="h-6 w-6" />
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
            </motion.div>
        </AnimatePresence>
    )
}
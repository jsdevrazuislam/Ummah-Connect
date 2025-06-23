'use client'

import { Volume2, VolumeX, Play, Pause, MoreVertical, Bookmark, Link, Bug } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function ShortsControls({
  isPlaying,
  isMuted,
  onPlayPause,
  onMuteUnmute,
}: {
  isPlaying: boolean
  isMuted: boolean
  onPlayPause: () => void
  onMuteUnmute: () => void
}) {
  const handleSaveShort = () => {
    console.log('Save short clicked')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  const handleReport = () => {
    console.log('Report clicked')
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute top-8 right-8 flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onPlayPause}
              className="text-white hover:bg-white/10 p-2 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isPlaying ? 'Pause' : 'Play'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMuteUnmute}
              className="text-white hover:bg-white/10 p-2 rounded-full"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isMuted ? 'Unmute' : 'Mute'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white hover:bg-white/10 p-2 rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                  <DropdownMenuItem onClick={handleSaveShort}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save Short
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReport}>
                    <Bug className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>More options</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
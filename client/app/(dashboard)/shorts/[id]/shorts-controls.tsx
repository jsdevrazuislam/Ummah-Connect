'use client';

import { Volume2, VolumeX, Play, Pause, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ShortsControls({
  isPlaying,
  isMuted,
  onPlayPause,
  onMuteUnmute,
}: {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onMuteUnmute: () => void;
}) {
  const handleSaveShort = () => {
    console.log('Save short clicked');
    // Implement save logic here
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleReport = () => {
    console.log('Report clicked');
    // Open modal or redirect to report page
  };

  return (
    <div className="absolute top-8 right-8 space-x-3 flex items-center">
      <button onClick={onPlayPause} className="text-white">
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>
      <button onClick={onMuteUnmute} className="text-white">
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-white">
            <MoreVertical className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32">
          <DropdownMenuItem onClick={handleSaveShort}>Save Short</DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>Copy Link</DropdownMenuItem>
          <DropdownMenuItem onClick={handleReport}>Report</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

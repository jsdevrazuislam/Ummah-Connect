"use client";

import { Bookmark, Bug, Link, MoreVertical, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ReportModal } from "@/components/report-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ShortsControls({
  isPlaying,
  isMuted,
  onPlayPause,
  onMuteUnmute,
  shortId,
}: {
  isPlaying: boolean;
  isMuted: boolean;
  shortId?: number;
  onPlayPause: () => void;
  onMuteUnmute: () => void;
}) {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSaveShort = () => {};

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.href}/${shortId}`);
    toast.success("Link copied to clipboard");
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute z-20 top-8 right-8 flex items-center">
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
            <p>{isPlaying ? "Pause" : "Play"}</p>
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
            <p>{isMuted ? "Unmute" : "Mute"}</p>
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
                <DropdownMenuContent className="w-64">
                  <DropdownMenuItem onClick={handleSaveShort} className="flex items-start gap-3">
                    <Bookmark className="mt-0.5 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Save Short</span>
                      <span className="text-xs text-muted-foreground">Bookmark this short for later</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleCopyLink} className="flex items-start gap-3">
                    <Link className="mt-0.5 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Copy Link</span>
                      <span className="text-xs text-muted-foreground">Share or save the short’s link</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleReport} className="flex items-start gap-3">
                    <Bug className="mt-0.5 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Report</span>
                      <span className="text-xs text-muted-foreground">Report inappropriate or harmful content</span>
                    </div>
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

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        id={2}
      />
    </TooltipProvider>
  );
}

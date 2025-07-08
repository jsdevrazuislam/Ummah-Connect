import React, { useRef, useState, useEffect } from 'react';
import Hls, { Level } from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function HLSVideoPlayer({ src, poster }: { src: string, poster?:string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(video.duration);
        setLevels(hls.levels);
      });
      
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setSelectedLevel(data.level);
        const level = hls.levels[data.level];
        setSelectedQuality(level ? `${level.height}p` : 'Auto');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    
    setShowPlayPauseIndicator(true);
    setTimeout(() => setShowPlayPauseIndicator(false), 1000);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && volume === 0) {
      video.volume = 0.7;
      setVolume(0.7);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const switchResolution = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setSelectedLevel(levelIndex);
      const level = hlsRef.current.levels[levelIndex];
      setSelectedQuality(level ? `${level.height}p` : 'Auto');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-4 bg-black rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full aspect-video cursor-pointer"
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        poster={poster}
      />

      <AnimatePresence>
        {showPlayPauseIndicator && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-black/50 rounded-full p-6">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <Slider
          min={0}
          max={duration}
          step={0.1}
          value={[currentTime]}
          onValueChange={handleSeek}
          className="mb-2"
          thumbClassName='hidden'
        />

        <div className="flex justify-between items-center text-white text-sm px-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={togglePlay}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <div 
              className="flex items-center gap-1 relative"
              ref={volumeRef}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => !showVolumeSlider && setShowVolumeSlider(false)}
            >
              <button 
                onClick={toggleMute}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              {showVolumeSlider && (
                <motion.div
                  className="absolute bottom-8 left-0 bg-black/80 p-2 rounded-md shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    className="h-24 w-2"
                    orientation="vertical"
                    thumbClassName='hidden'
                  />
                </motion.div>
              )}
            </div>

            <span className="text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                >
                  {playbackRate}x
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32">
                <p className="text-xs text-muted-foreground mb-2">Playback Speed</p>
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full mb-1 justify-start"
                    onClick={() => changePlaybackRate(rate)}
                  >
                    {rate}x
                    {playbackRate === rate && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>

            {levels.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                  >
                    {selectedQuality}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-32">
                  <p className="text-xs text-muted-foreground mb-2">Quality</p>
                  <Button
                    variant={selectedLevel === -1 ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full mb-1 justify-start"
                    onClick={() => switchResolution(-1)}
                  >
                    Auto
                    {selectedLevel === -1 && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                  {levels.map((lvl, idx) => (
                    <Button
                      key={idx}
                      variant={selectedLevel === idx ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full mb-1 justify-start"
                      onClick={() => switchResolution(idx)}
                    >
                      {lvl.height}p
                      {selectedLevel === idx && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
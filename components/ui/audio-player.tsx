'use client'

import * as React from 'react'
import { Loader2, Pause, Play, Settings2 } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Types
export interface AudioPlayerItem<TData = unknown> {
  id: string | number
  src: string
  data?: TData
}

interface AudioPlayerContextValue<TData = unknown> {
  ref: React.RefObject<HTMLAudioElement>
  activeItem: AudioPlayerItem<TData> | null
  duration: number
  error: MediaError | null
  isPlaying: boolean
  isBuffering: boolean
  playbackRate: number
  isItemActive: (item: AudioPlayerItem<TData>) => boolean
  setActiveItem: (item: AudioPlayerItem<TData> | null) => void
  play: (item?: AudioPlayerItem<TData>) => void
  pause: () => void
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
}

const AudioPlayerContext = React.createContext<AudioPlayerContextValue | null>(null)

// Provider
export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [activeItem, setActiveItem] = React.useState<AudioPlayerItem | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [error, setError] = React.useState<MediaError | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isBuffering, setIsBuffering] = React.useState(false)
  const [playbackRate, setPlaybackRateState] = React.useState(1)

  const isItemActive = React.useCallback(
    (item: AudioPlayerItem) => activeItem?.id === item.id,
    [activeItem]
  )

  const play = React.useCallback(
    (item?: AudioPlayerItem) => {
      const audio = audioRef.current
      if (!audio) return

      if (item && item.id !== activeItem?.id) {
        setActiveItem(item)
        audio.src = item.src
        audio.load()
      }

      audio.play().catch((err) => {
        console.error('Playback error:', err)
        setError(err)
      })
    },
    [activeItem]
  )

  const pause = React.useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const seek = React.useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
    }
  }, [])

  const setPlaybackRate = React.useCallback((rate: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = rate
      setPlaybackRateState(rate)
    }
  }, [])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleError = () => setError(audio.error)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const value: AudioPlayerContextValue = {
    ref: audioRef,
    activeItem,
    duration,
    error,
    isPlaying,
    isBuffering,
    playbackRate,
    isItemActive,
    setActiveItem,
    play,
    pause,
    seek,
    setPlaybackRate,
  }

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </AudioPlayerContext.Provider>
  )
}

// Hook
export function useAudioPlayer<TData = unknown>(): AudioPlayerContextValue<TData> {
  const context = React.useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider')
  }
  return context as AudioPlayerContextValue<TData>
}

// Time hook
export function useAudioPlayerTime(): number {
  const { ref } = useAudioPlayer()
  const [time, setTime] = React.useState(0)

  React.useEffect(() => {
    const audio = ref.current
    if (!audio) return

    let rafId: number

    const updateTime = () => {
      setTime(audio.currentTime)
      rafId = requestAnimationFrame(updateTime)
    }

    rafId = requestAnimationFrame(updateTime)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [ref])

  return time
}

// Components
interface AudioPlayerButtonProps<TData = unknown> extends ButtonProps {
  item?: AudioPlayerItem<TData>
}

export function AudioPlayerButton<TData = unknown>({
  item,
  ...props
}: AudioPlayerButtonProps<TData>) {
  const { isPlaying, isBuffering, isItemActive, play, pause } = useAudioPlayer<TData>()

  const isActive = item ? isItemActive(item) : true
  const showPlaying = isActive && isPlaying
  const showBuffering = isActive && isBuffering

  const handleClick = () => {
    if (showPlaying) {
      pause()
    } else {
      play(item)
    }
  }

  return (
    <Button onClick={handleClick} {...props}>
      {showBuffering ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  )
}

export function AudioPlayerProgress({ className, ...props }: React.ComponentProps<typeof Slider>) {
  const { duration, seek } = useAudioPlayer()
  const time = useAudioPlayerTime()
  const [isSeeking, setIsSeeking] = React.useState(false)
  const [seekValue, setSeekValue] = React.useState(0)

  const displayValue = isSeeking ? seekValue : time

  const handleValueChange = (value: number[]) => {
    setIsSeeking(true)
    setSeekValue(value[0])
  }

  const handleValueCommit = (value: number[]) => {
    seek(value[0])
    setIsSeeking(false)
  }

  return (
    <Slider
      min={0}
      max={duration || 100}
      value={[displayValue]}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      className={className}
      {...props}
    />
  )
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayerTime({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const time = useAudioPlayerTime()
  return (
    <span className={cn('text-sm tabular-nums', className)} {...props}>
      {formatTime(time)}
    </span>
  )
}

export function AudioPlayerDuration({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { duration } = useAudioPlayer()
  return (
    <span className={cn('text-sm tabular-nums', className)} {...props}>
      {formatTime(duration)}
    </span>
  )
}

interface AudioPlayerSpeedProps extends ButtonProps {
  speeds?: readonly number[]
}

export function AudioPlayerSpeed({
  speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  variant = 'ghost',
  size = 'icon',
  ...props
}: AudioPlayerSpeedProps) {
  const { playbackRate, setPlaybackRate } = useAudioPlayer()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} {...props}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {speeds.map((speed) => (
          <DropdownMenuItem
            key={speed}
            onClick={() => setPlaybackRate(speed)}
            className={cn(playbackRate === speed && 'bg-accent')}
          >
            {speed === 1 ? 'Normal' : `${speed}x`}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface AudioPlayerSpeedButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  speeds?: readonly number[]
}

export function AudioPlayerSpeedButtonGroup({
  speeds = [0.5, 1, 1.5, 2],
  className,
  ...props
}: AudioPlayerSpeedButtonGroupProps) {
  const { playbackRate, setPlaybackRate } = useAudioPlayer()

  return (
    <div className={cn('flex gap-1', className)} {...props}>
      {speeds.map((speed) => (
        <Button
          key={speed}
          variant={playbackRate === speed ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPlaybackRate(speed)}
        >
          {speed === 1 ? 'Normal' : `${speed}x`}
        </Button>
      ))}
    </div>
  )
}

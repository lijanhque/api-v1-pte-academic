'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface AudioPlayerProps {
    src: string
    className?: string
}

export function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const handleEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [])

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const handleVolumeChange = (value: number[]) => {
        if (audioRef.current) {
            const newVolume = value[0]
            audioRef.current.volume = newVolume
            setVolume(newVolume)
            setIsMuted(newVolume === 0)
        }
    }

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume || 0.5
                setIsMuted(false)
            } else {
                audioRef.current.volume = 0
                setIsMuted(true)
            }
        }
    }

    const changePlaybackRate = () => {
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
        const currentIndex = rates.indexOf(playbackRate)
        const nextIndex = (currentIndex + 1) % rates.length
        const newRate = rates[nextIndex]

        if (audioRef.current) {
            audioRef.current.playbackRate = newRate
            setPlaybackRate(newRate)
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <div className={`flex items-center gap-3 p-3 bg-muted/30 rounded-lg border ${className}`}>
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause */}
            <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="h-8 w-8 p-0"
            >
                {isPlaying ? (
                    <Pause className="h-4 w-4" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
            </Button>

            {/* Progress */}
            <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground min-w-[35px]">
                    {formatTime(currentTime)}
                </span>
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[35px]">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Playback Speed */}
            <Button
                size="sm"
                variant="ghost"
                onClick={changePlaybackRate}
                className="h-8 px-2 text-xs"
            >
                {playbackRate}x
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 w-24">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0"
                >
                    {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                    ) : (
                        <Volume2 className="h-4 w-4" />
                    )}
                </Button>
                <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-16"
                />
            </div>
        </div>
    )
}

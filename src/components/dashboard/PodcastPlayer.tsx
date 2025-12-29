'use client'

// ============================================
// 🎧 PodcastPlayer - Mini Reproductor de Audio
// ============================================
// Reproductor custom para podcasts con controles de reproducción

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { formatDuration, type Recurso } from '@/types/recursos'

interface PodcastPlayerProps {
  recurso: Recurso
  className?: string
}

export function PodcastPlayer({ recurso, className }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(recurso.duracion || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // URL del audio (viene de Cloudflare R2 vía url en la DB)
  const audioUrl = recurso.url

  // Manejar eventos del audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      setError('Error cargando el audio')
      setIsLoading(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handlePlaying = () => {
      setIsLoading(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
    }
  }, [audioUrl])

  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (err) {
      console.error('Error reproduciendo audio:', err)
      setError('Error reproduciendo el audio')
    }
  }, [isPlaying])

  // Seek
  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setProgress(value[0])
  }, [])

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
    audioRef.current.currentTime = newTime
    setProgress(newTime)
  }, [duration])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0])
    if (value[0] > 0 && isMuted) {
      setIsMuted(false)
    }
  }, [isMuted])

  if (!audioUrl) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>
        Audio no disponible
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-xs text-destructive', className)}>
        {error}
      </div>
    )
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className={cn('space-y-2', className)}>
      {/* Barra de progreso */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground tabular-nums w-10">
          {formatDuration(Math.round(progress))}
        </span>
        
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="flex-1"
          disabled={isLoading}
        />
        
        <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">
          {formatDuration(Math.round(duration))}
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Skip backward */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => skip(-10)}
            disabled={isLoading}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          {/* Skip forward */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => skip(10)}
            disabled={isLoading}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Volumen */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-16"
          />
        </div>
      </div>

      {/* Barra de progreso visual (mini) */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-vt-purple transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Audio element (hidden) */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  )
}


"use client"

import * as React from "react"
import { Check, Mic, MicOff, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LiveWaveform } from "@/components/ui/live-waveform"

export interface AudioDevice {
  deviceId: string
  label: string
  groupId: string
}

interface UseAudioDevicesReturn {
  devices: AudioDevice[]
  loading: boolean
  error: string | null
  hasPermission: boolean
  loadDevices: () => Promise<void>
}

export function useAudioDevices(): UseAudioDevicesReturn {
  const [devices, setDevices] = React.useState<AudioDevice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [hasPermission, setHasPermission] = React.useState(false)

  const loadDevices = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)

      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = deviceList
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId,
        }))

      setDevices(audioInputs)
    } catch (err) {
      console.error("Error loading audio devices:", err)
      setError(err instanceof Error ? err.message : "Failed to load devices")
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDevices()

    const handleDeviceChange = () => loadDevices()
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange)
    }
  }, [loadDevices])

  return { devices, loading, error, hasPermission, loadDevices }
}

interface MicSelectorProps {
  value?: string
  onValueChange?: (deviceId: string) => void
  muted?: boolean
  onMutedChange?: (muted: boolean) => void
  disabled?: boolean
  className?: string
}

export const MicSelector = React.forwardRef<HTMLDivElement, MicSelectorProps>(
  (
    {
      value,
      onValueChange,
      muted: controlledMuted,
      onMutedChange,
      disabled,
      className,
    },
    ref
  ) => {
    const { devices, hasPermission, loadDevices } = useAudioDevices()
    const [internalValue, setInternalValue] = React.useState("")
    const [internalMuted, setInternalMuted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)

    const isControlled = value !== undefined
    const selectedId = isControlled ? value : internalValue
    const isMuted = controlledMuted !== undefined ? controlledMuted : internalMuted

    // Auto-select first device if none selected
    React.useEffect(() => {
      if (!selectedId && devices.length > 0) {
        const defaultDevice =
          devices.find((d) => d.deviceId === "default") || devices[0]
        if (defaultDevice) {
          if (!isControlled) setInternalValue(defaultDevice.deviceId)
          onValueChange?.(defaultDevice.deviceId)
        }
      }
    }, [devices, selectedId, isControlled, onValueChange])

    const handleValueChange = (deviceId: string) => {
      if (!isControlled) setInternalValue(deviceId)
      onValueChange?.(deviceId)
    }

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation()
      const newMuted = !isMuted
      if (onMutedChange) {
        onMutedChange(newMuted)
      } else {
        setInternalMuted(newMuted)
      }
    }

    const selectedDevice = devices.find((d) => d.deviceId === selectedId)

    if (!hasPermission) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground",
            className
          )}
        >
          <Mic className="h-4 w-4" />
          <span className="cursor-pointer hover:underline" onClick={loadDevices}>
            Click to enable microphone
          </span>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        <Select
          value={selectedId}
          onValueChange={handleValueChange}
          disabled={disabled}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="w-[280px] h-10">
            <div className="flex items-center gap-2 truncate">
              <div
                role="button"
                tabIndex={0}
                onClick={toggleMute}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors z-10",
                  isMuted && "text-muted-foreground"
                )}
              >
                {isMuted ? (
                  <MicOff className="h-3.5 w-3.5" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
              </div>
              <SelectValue placeholder="Select microphone">
                {selectedDevice?.label || "Select microphone"}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {isOpen && !isMuted && (
              <div className="p-2 border-b mb-1">
                <div className="text-xs text-muted-foreground mb-2 px-1 font-medium flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  Input Test
                </div>
                <div className="h-12 bg-muted/30 rounded-md overflow-hidden relative">
                  <LiveWaveform
                    deviceId={selectedId}
                    className="text-primary h-full w-full"
                    barCount={30}
                    barWidth={3}
                    gap={2}
                  />
                </div>
              </div>
            )}
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                <div className="flex items-center gap-2">
                  <span className="truncate">{device.label}</span>
                  {selectedId === device.deviceId && (
                    <Check className="h-4 w-4 ml-auto opacity-50" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
)

MicSelector.displayName = "MicSelector"

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PTESection } from '@/components/pte/universal'

// ============ Types ============

export type AttemptStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'completed' | 'error'

export interface AttemptScore {
  overall: number
  breakdown?: Record<string, number>
  feedback?: string
  suggestions?: string[]
}

export interface AttemptResult<T = unknown> {
  id: string
  questionId: string
  userResponse: T
  score?: AttemptScore
  createdAt: Date
}

export interface UseUniversalAttemptOptions {
  section: PTESection
  questionType: string
  questionId: string
  prepTimeMs?: number
  recordTimeMs?: number
  onComplete?: (result: AttemptResult) => void
  onError?: (error: Error) => void
  submitFn?: (data: unknown) => Promise<AttemptResult>
}

export interface UseUniversalAttemptReturn {
  // State
  status: AttemptStatus
  timeRemaining: number
  isPreparing: boolean
  isRecording: boolean
  isProcessing: boolean
  isCompleted: boolean
  hasError: boolean
  error: Error | null
  result: AttemptResult | null
  // Actions
  startPrep: () => void
  startRecording: () => void
  stopRecording: () => void
  submitResponse: (response: unknown) => Promise<void>
  reset: () => void
  // Timer
  prepProgress: number
  recordProgress: number
}

// ============ Hook ============

export function useUniversalAttempt({
  section,
  questionType,
  questionId,
  prepTimeMs = 0,
  recordTimeMs = 30000,
  onComplete,
  onError,
  submitFn,
}: UseUniversalAttemptOptions): UseUniversalAttemptReturn {
  const [status, setStatus] = useState<AttemptStatus>('idle')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const targetTimeRef = useRef<number>(0)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Timer logic
  const startTimer = useCallback((durationMs: number, onEnd: () => void) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    startTimeRef.current = Date.now()
    targetTimeRef.current = durationMs
    setTimeRemaining(durationMs)

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, durationMs - elapsed)
      setTimeRemaining(remaining)

      if (remaining === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        onEnd()
      }
    }, 100)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Start preparation phase
  const startPrep = useCallback(() => {
    if (prepTimeMs > 0) {
      setStatus('preparing')
      startTimer(prepTimeMs, () => {
        // Auto-start recording after prep
        setStatus('recording')
        startTimer(recordTimeMs, () => {
          setStatus('processing')
        })
      })
    } else {
      // Skip to recording if no prep time
      setStatus('recording')
      startTimer(recordTimeMs, () => {
        setStatus('processing')
      })
    }
  }, [prepTimeMs, recordTimeMs, startTimer])

  // Start recording (manual)
  const startRecording = useCallback(() => {
    stopTimer()
    setStatus('recording')
    startTimer(recordTimeMs, () => {
      setStatus('processing')
    })
  }, [recordTimeMs, startTimer, stopTimer])

  // Stop recording (manual)
  const stopRecording = useCallback(() => {
    stopTimer()
    setStatus('processing')
  }, [stopTimer])

  // Submit response
  const submitResponse = useCallback(async (response: unknown) => {
    setStatus('processing')
    setError(null)

    try {
      let attemptResult: AttemptResult

      if (submitFn) {
        attemptResult = await submitFn(response)
      } else {
        // Default API call
        const apiResponse = await fetch(`/api/pte/${section}/${questionType}/${questionId}/attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response }),
        })

        if (!apiResponse.ok) {
          throw new Error('Failed to submit attempt')
        }

        attemptResult = await apiResponse.json()
      }

      setResult(attemptResult)
      setStatus('completed')
      onComplete?.(attemptResult)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setStatus('error')
      onError?.(error)
    }
  }, [section, questionType, questionId, submitFn, onComplete, onError])

  // Reset attempt
  const reset = useCallback(() => {
    stopTimer()
    setStatus('idle')
    setTimeRemaining(0)
    setError(null)
    setResult(null)
  }, [stopTimer])

  // Computed values
  const isPreparing = status === 'preparing'
  const isRecording = status === 'recording'
  const isProcessing = status === 'processing'
  const isCompleted = status === 'completed'
  const hasError = status === 'error'

  const prepProgress = isPreparing && prepTimeMs > 0
    ? ((prepTimeMs - timeRemaining) / prepTimeMs) * 100
    : isPreparing ? 0 : 100

  const recordProgress = isRecording && recordTimeMs > 0
    ? ((recordTimeMs - timeRemaining) / recordTimeMs) * 100
    : isRecording ? 0 : (isCompleted || isProcessing ? 100 : 0)

  return {
    status,
    timeRemaining,
    isPreparing,
    isRecording,
    isProcessing,
    isCompleted,
    hasError,
    error,
    result,
    startPrep,
    startRecording,
    stopRecording,
    submitResponse,
    reset,
    prepProgress,
    recordProgress,
  }
}

// ============ Timer Display Helpers ============

export function formatTimeMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatTimeSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ============ Timer Config by Question Type ============

export const TIMER_CONFIG: Record<string, { prepMs?: number; recordMs: number }> = {
  // Speaking
  read_aloud: { prepMs: 35000, recordMs: 40000 },
  repeat_sentence: { recordMs: 15000 },
  describe_image: { prepMs: 25000, recordMs: 40000 },
  retell_lecture: { prepMs: 10000, recordMs: 40000 },
  answer_short_question: { recordMs: 10000 },
  summarize_group_discussion: { prepMs: 20000, recordMs: 60000 },
  respond_to_a_situation: { prepMs: 20000, recordMs: 40000 },
  // Writing
  summarize_written_text: { recordMs: 600000 }, // 10 minutes
  write_essay: { recordMs: 1200000 }, // 20 minutes
  // Listening
  summarize_spoken_text: { recordMs: 600000 }, // 10 minutes
  write_from_dictation: { recordMs: 60000 }, // 1 minute
}

export function getTimerConfig(questionType: string) {
  return TIMER_CONFIG[questionType] || { recordMs: 30000 }
}

'use client'

import React, { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import CountdownTimer from '@/components/pte/timers/CountdownTimer'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  getDefaultTimings,
  startValidatedItemSession,
  type StartSessionResponse,
} from '@/lib/pte/attempts'
import { formatLabel } from '@/lib/pte/timing'

type Phase = 'idle' | 'prepare' | 'answering' | 'submitting' | 'done' | 'error'

type PteSection = 'speaking' | 'writing' | 'reading' | 'listening'

export type AttemptControllerProps = {
  section: PteSection
  questionType?: string
  questionId: string

  // duration for item (speaking/writing) or section (reading/listening)
  // - For speaking: provide { prepMs?, answerMs }
  // - For writing:  provide { answerMs }
  // - For section-wide pages use SectionTimer component (not this controller)
  duration?: {
    prepMs?: number
    answerMs?: number
  }

  // Called when we need to submit (auto on expiry or explicit submit)
  // Implementations should send to their section attempt API and return a promise.
  onSubmit: (ctx: {
    token: string
    session: StartSessionResponse
    phase: 'auto-expire' | 'user-submit'
  }) => Promise<void>

  // Optional: Allow skip control
  allowSkip?: boolean

  // Optional: render prop to customize UI (e.g., SpeakingAttempt)
  children?: (ctx: {
    phase: Phase
    token?: string
    session?: StartSessionResponse | null
    controls: {
      start: () => void
      submit: () => void
      skip: () => void
      disabled: boolean
    }
    times: {
      // Server times for current windows
      startAt?: number
      endAt?: number
      prepStartAt?: number
      prepEndAt?: number
      answerStartAt?: number
      answerEndAt?: number
    }
  }) => React.ReactNode

  // Notifies consumer when phase changes (used by SpeakingAttempt to auto-start/stop recording)
  onPhaseChange?: (phase: Phase) => void

  // Accessible labels
  label?: string
}

export default function AttemptController({
  section,
  questionType,
  questionId,
  duration,
  onSubmit,
  allowSkip = false,
  children,
  onPhaseChange,
  label,
}: AttemptControllerProps) {
  // Resolve default timings if not provided
  const resolved = useMemo(() => {
    const def = getDefaultTimings(section, questionType)
    return {
      prepMs: duration?.prepMs ?? def.prepMs ?? 0,
      answerMs: duration?.answerMs ?? def.answerMs ?? 60_000, // safe fallback
    }
  }, [duration?.answerMs, duration?.prepMs, questionType, section])

  const [phase, setPhase] = useState<Phase>('idle')
  const [session, setSession] = useState<StartSessionResponse | null>(null)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // separate windows inside the session window
  const prepStartAt = useMemo(
    () => session?.startAt ?? undefined,
    [session?.startAt]
  )
  const prepEndAt = useMemo(
    () =>
      session ? session.startAt + Math.max(0, resolved.prepMs) : undefined,
    [session, resolved.prepMs]
  )
  const answerStartAt = useMemo(
    () =>
      session ? session.endAt - Math.max(0, resolved.answerMs) : undefined,
    [session, resolved.answerMs]
  )
  const answerEndAt = useMemo(
    () => session?.endAt ?? undefined,
    [session?.endAt]
  )

  // Accessibility live announcements
  const [announcement, setAnnouncement] = useState('')
  const announce = useEffectEvent((msg: string) => {
    setAnnouncement(msg)
    // clear after a short delay to avoid screen reader repetition
    const id = window.setTimeout(() => setAnnouncement(''), 1500)
    return () => window.clearTimeout(id)
  })

  // Notify parent on phase changes
  useEffect(() => {
    onPhaseChange?.(phase)
    const unsub = announce(
      phase === 'prepare'
        ? 'Preparation started.'
        : phase === 'answering'
          ? 'Answering started.'
          : phase === 'submitting'
            ? 'Submitting your attempt.'
            : phase === 'done'
              ? 'Submission completed.'
              : ''
    )
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [announce, onPhaseChange, phase])

  // beforeunload guard while active
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (phase === 'prepare' || phase === 'answering') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  const start = useCallback(async () => {
    setError(null)
    setStarting(true)
    try {
      const s = await startValidatedItemSession({
        section,
        questionType,
        questionId,
        prepMs: resolved.prepMs || 0,
        answerMs: resolved.answerMs,
      })
      setSession(s)
      if (resolved.prepMs && resolved.prepMs > 0) {
        setPhase('prepare')
      } else {
        setPhase('answering')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to start timed session.')
      setPhase('error')
    } finally {
      setStarting(false)
    }
  }, [questionId, questionType, resolved.answerMs, resolved.prepMs, section])

  const submit = useCallback(
    async (kind: 'auto-expire' | 'user-submit' = 'user-submit') => {
      if (!session?.token) return
      setSubmitting(true)
      setPhase('submitting')
      setError(null)
      console.log('[AttemptController] submitting…', { kind })
      try {
        await onSubmit({ token: session.token, session, phase: kind })
        setPhase('done')
      } catch (e: any) {
        setError(e?.message || 'Submission failed')
        setPhase('error')
      } finally {
        setSubmitting(false)
      }
    },
    [onSubmit, session]
  )

  const skip = useCallback(() => {
    // For now, treat as done without submission
    setPhase('done')
  }, [])

  // Prep expire -> transition to answering
  const onPrepExpire = useCallback(() => {
    if (phase === 'prepare') {
      setPhase('answering')
    }
  }, [phase])

  // Answer expire -> auto submit
  const onAnswerExpire = useCallback(() => {
    if (phase === 'answering') {
      void submit('auto-expire')
    }
  }, [phase, submit])

  const controls = useMemo(
    () => ({
      start,
      submit: () => submit('user-submit'),
      skip,
      disabled:
        starting || submitting || phase === 'submitting' || phase === 'done',
    }),
    [phase, skip, start, starting, submit, submitting]
  )

  const times = useMemo(
    () => ({
      startAt: session?.startAt,
      endAt: session?.endAt,
      prepStartAt,
      prepEndAt,
      answerStartAt,
      answerEndAt,
    }),
    [
      answerEndAt,
      answerStartAt,
      prepEndAt,
      prepStartAt,
      session?.endAt,
      session?.startAt,
    ]
  )

  const headerLabel = useMemo(
    () => label || formatLabel(section, questionType),
    [label, questionType, section]
  )

  // Render
  return (
    <div className="w-full space-y-3" role="group" aria-label={headerLabel}>
      {/* SR live region for phase announcements */}
      <div aria-live="assertive" className="sr-only">
        {announcement}
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {headerLabel} ·{' '}
          {phase === 'idle'
            ? 'Ready'
            : phase === 'prepare'
              ? 'Preparation'
              : phase === 'answering'
                ? 'Answering'
                : phase === 'submitting'
                  ? 'Submitting'
                  : phase === 'done'
                    ? 'Completed'
                    : 'Error'}
        </div>
        <div className="flex items-center gap-2">
          {phase === 'idle' ? (
            <Button
              aria-label="Start attempt"
              onClick={start}
              disabled={starting}
            >
              {starting ? (
                <>
                  <Spinner size={16} className="mr-2" /> Starting…
                </>
              ) : (
                'Start'
              )}
            </Button>
          ) : phase === 'prepare' || phase === 'answering' ? (
            <>
              <Button
                aria-label="Submit now"
                onClick={() => submit('user-submit')}
                disabled={controls.disabled || phase !== 'answering'}
              >
                Submit
              </Button>
              {allowSkip ? (
                <Button
                  aria-label="Skip item"
                  onClick={skip}
                  variant="outline"
                  disabled={controls.disabled}
                >
                  Skip
                </Button>
              ) : null}
            </>
          ) : phase === 'submitting' ? (
            <Button aria-disabled className="opacity-80">
              <Spinner size={16} className="mr-2" /> Submitting…
            </Button>
          ) : phase === 'done' ? (
            <span className="text-sm text-emerald-600">✓ Submitted</span>
          ) : null}
        </div>
      </div>

      {/* Timers */}
      {session ? (
        <>
          {resolved.prepMs > 0 && phase !== 'idle' && (
            <div className={phase === 'prepare' ? '' : 'opacity-60'}>
              <CountdownTimer
                durationMs={Math.max(0, resolved.prepMs)}
                startTsServer={prepStartAt!}
                endTsServer={prepEndAt}
                onExpire={onPrepExpire}
                label="Preparation"
                srLabel="Preparation countdown"
              />
            </div>
          )}

          {/* Answer timer (visible as soon as session exists; emphasized during answering) */}
          <div
            className={
              phase === 'answering'
                ? ''
                : phase === 'prepare'
                  ? 'opacity-60'
                  : ''
            }
          >
            <CountdownTimer
              durationMs={Math.max(0, resolved.answerMs)}
              // Important: for the answer timer we pin start to answerStartAt so the display is only for answer phase
              startTsServer={answerStartAt!}
              endTsServer={answerEndAt}
              onExpire={onAnswerExpire}
              label="Answer time"
              srLabel="Answer countdown"
            />
          </div>
        </>
      ) : phase !== 'idle' ? (
        <div className="text-muted-foreground text-sm">Preparing timers…</div>
      ) : null}

      {/* Error */}
      {error ? (
        <div role="alert" className="text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {/* Custom child renderer (e.g., SpeakingAttempt injects recorder) */}
      {children
        ? children({
            phase,
            token: session?.token,
            session,
            controls,
            times,
          })
        : null}
    </div>
  )
}

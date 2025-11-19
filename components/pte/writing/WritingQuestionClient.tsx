import { countWords } from '@/lib/pte/utils'
import React, { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import WritingAttemptsList from './WritingAttemptsList'
import WritingInput from './WritingInput'
import AiScoreDisplay from './AiScoreDisplay';
import WritingScoreBreakdown from './WritingScoreBreakdown'

type WritingType = 'summarize_written_text' | 'write_essay'

type Props = {
  questionId: string
  questionType: WritingType
}

type QuestionPayload = {
  question: {
    id: string
    type: WritingType
    title?: string | null
    promptText?: string | null
    difficulty?: string | null
    createdAt?: string | null
  }
  prevId: string | null
  nextId: string | null
}

export default function WritingQuestionClient({
  questionId,
  questionType,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [payload, setPayload] = useState<QuestionPayload | null>(null)

  const [text, setText] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastScores, setLastScores] = useState<any | null>(null)
  const [aiScore, setAiScore] = useState<any | null>(null)
  const [isScoringAi, setIsScoringAi] = useState(false)

  const [attemptsKey, setAttemptsKey] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutes in seconds

  // Stable event handler for saving draft
  const saveDraft = useEffectEvent((text: string, questionId: string) => {
    const key = `pte-wr-draft:${questionId}`
    try {
      if (text && text.trim().length > 0) {
        localStorage.setItem(key, text)
      } else {
        localStorage.removeItem(key)
      }
    } catch {}
  })

  // Auto-save draft in localStorage
  useEffect(() => {
    const key = `pte-wr-draft:${questionId}`
    const saved = localStorage.getItem(key)
    if (saved) setText(saved)
    return () => {}
  }, [questionId])

  useEffect(() => {
    const id = setTimeout(() => saveDraft(text, questionId), 400)
    return () => clearTimeout(id)
  }, [text, questionId, saveDraft])

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(
        `/api/writing/questions/${encodeURIComponent(questionId)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Failed to load question (${res.status})`
        throw new Error(msg)
      }
      const data = (await res.json()) as QuestionPayload
      setPayload(data)
      setTimeLeft(10 * 60) // Reset timer on new question
    } catch (e: any) {
      setFetchError(e?.message || 'Failed to load question.')
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  const onSubmit = useCallback(async () => {
    const wordCount = countWords(text);
    if (questionType === 'summarize_written_text') {
      if (wordCount < 5 || wordCount > 75) {
        setSubmitError('Your summary must be between 5 and 75 words.');
        return;
      }
    }

    if (!text || text.trim().length === 0) {
      setSubmitError('Please write your response first.')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      const timeTaken = (10 * 60) - timeLeft; // Calculate time taken

      const body = {
        questionId,
        type: questionType,
        textAnswer: text,
        timeTaken,
      }
      const res = await fetch('/api/writing/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        setSubmitError(
          'Login required to submit attempts. Sign in to continue.'
        )
        return
      }
      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Submission failed (${res.status})`
        throw new Error(msg)
      }

      const json = await res.json()
      setLastScores(json?.scores || null)

      // Refresh attempts
      setAttemptsKey((k) => k + 1)

      // Reset timer; keep text to allow user to refine if desired.
      setTimeLeft(10 * 60)

      // Now, get the AI score
      setIsScoringAi(true);
      setAiScore(null);
      try {
        const aiRes = await fetch('/api/writing/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: payload?.question?.promptText, answer: text }),
        });
        if (!aiRes.ok) {
          throw new Error('Failed to get AI score.');
        }
        const aiJson = await aiRes.json();
        setAiScore(aiJson);
      } catch (e) {
        console.error(e);
        // Handle AI scoring error separately if needed
      } finally {
        setIsScoringAi(false);
      }

    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to submit attempt.')
    } finally {
      setSubmitting(false)
    }
  }, [text, questionId, questionType, timeLeft])

  // Countdown timer effect
  useEffect(() => {
    if (loading || submitting) return;

    if (timeLeft <= 0) {
      onSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, loading, submitting, onSubmit]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground rounded-md border p-4 text-sm">
          Loading question…
        </div>
      </div>
    )
  }
  if (fetchError) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-md border p-4 text-sm text-red-600"
        >
          {fetchError}
        </div>
      </div>
    )
  }

  const q = payload?.question
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{q?.title}</h2>
        <div className="prose prose-sm max-w-none">
          <p>{q?.promptText}</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3 rounded-md border p-4">
        <WritingInput
          questionType={questionType}
          value={text}
          onChange={setText}
          disabled={submitting}
        />

        <div className="flex items-center gap-2">
          <Button
            aria-label="Submit attempt"
            onClick={onSubmit}
            disabled={!text || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
          <Button
            aria-label="Clear draft"
            variant="outline"
            disabled={submitting}
            onClick={() => {
              setText('')
              try {
                localStorage.removeItem(`pte-wr-draft:${questionId}`)
              } catch {}
            }}
          >
            Clear
          </Button>
          <div className="flex-grow text-right font-mono text-lg">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        {submitError ? (
          <div role="alert" className="text-sm text-red-600">
            {submitError}
            {submitError.toLowerCase().includes('login') ? (
              <span>
                {' '}
                ·{' '}
                <a href="/sign-in" className="underline">
                  Sign in
                </a>
              </span>
            ) : null}
          </div>
        ) : null }
      </div>

      {/* Score breakdown (last submission) */}
      {lastScores ? (
        <div className="rounded-md border p-4">
          <WritingScoreBreakdown scores={lastScores} />
        </div>
      ) : null}

      {/* AI Score Display */}
      {isScoringAi && (
        <div className="rounded-md border p-4 text-center">
          <p className="text-sm text-muted-foreground">Generating AI analysis...</p>
        </div>
      )}
      {aiScore && <AiScoreDisplay scoreData={aiScore} userText={text} />}

      {/* Attempts */}
      <div className="rounded-md border p-4">
        <WritingAttemptsList key={attemptsKey} questionId={questionId} />
      </div>
    </div>
  )
}

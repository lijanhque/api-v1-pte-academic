import 'server-only'
import { NextResponse } from 'next/server'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/server'
import { db } from '@/lib/db/drizzle'
import {
  speakingAttempts,
  speakingQuestions,
  type SpeakingAttempt,
} from '@/lib/db/schema'
import {
  getSpeakingQuestionById,
  listSpeakingAttemptsByUser,
} from '@/lib/pte/queries'
import { scoreAttempt } from '@/lib/pte/speaking-score'
import { getTranscriber } from '@/lib/pte/transcribe'
import { SpeakingAttemptBodySchema } from '../schemas'

export const preferredRegion = 'auto'
export const maxDuration = 60

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

/**
 * Check if a user is within the hourly speaking-attempts limit.
 *
 * @param userId - The user ID whose attempts will be counted
 * @param maxPerHour - Maximum allowed attempts in the past hour (default: 60)
 * @returns An object with `count` — the number of attempts in the last hour — and `allowed` — `true` if `count` is less than `maxPerHour`, `false` otherwise
 */
async function checkRateLimit(userId: string, maxPerHour = 60) {
  // DB-only soft rate limit: count attempts in the last hour
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(speakingAttempts)
    .where(
      and(
        eq(speakingAttempts.userId, userId),
        sql`${speakingAttempts.createdAt} > now() - interval '1 hour'`
      )
    )
  const count = Number(rows[0]?.count || 0)
  return { count, allowed: count < maxPerHour }
}

// POST /api/speaking/attempts
/**
 * Create a new speaking attempt: validates the request, enforces rate limits and question constraints, transcribes and scores the audio, persists the attempt, and returns the saved record with scoring feedback.
 *
 * @param request - HTTP request whose JSON body must include `questionId`, `type`, `audioUrl`, `durationMs`, and optional `timings`
 * @returns A NextResponse with a JSON body `{ attempt: SpeakingAttempt, feedback?: any }` and HTTP 201 on success; on failure returns a JSON error response with an appropriate status code and error code.
export /**
 * Create a new speaking attempt for the authenticated user.
 *
 * Validates the request body, enforces per-user rate limits and question constraints, attempts transcription,
 * scores the attempt, persists the attempt record (including derived score columns), and returns the saved record with feedback.
 *
 * @returns An object containing the persisted `attempt` record and generated `feedback` for the attempt
 */
async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // Auth
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    // Validate body
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(
        415,
        'Content-Type must be application/json',
        'UNSUPPORTED_MEDIA_TYPE'
      )
    }

    // Validate timing window (anti-tamper)
    const timingCheck = await validateTimingFromRequest(request, {
      graceMs: 2000,
    })
    if (!timingCheck.ok) {
      return error(timingCheck.status, timingCheck.message, timingCheck.code)
    }

    const json = await request.json()
    const parsed = SpeakingAttemptBodySchema.safeParse(json)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }
    const { questionId, type, audioUrl, durationMs, timings } = parsed.data

    // Rate-limit
    const rl = await checkRateLimit(userId)
    if (!rl.allowed) {
      return error(
        429,
        'Rate limit exceeded: max 60 attempts per hour',
        'RATE_LIMITED'
      )
    }

    // Validate question exists and type matches
    const question = await getSpeakingQuestionById(questionId)
    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }
    if (question.type !== type) {
      return error(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    }
    if (question.isActive === false) {
      return error(400, 'Question is not active', 'INACTIVE_QUESTION')
    }

    // Transcribe
    let transcript = ''
    let transcriptionError: string | undefined
    let transcriberProvider = 'none'
    try {
      const transcriber = await getTranscriber()
      const tr = await transcriber.transcribe({ audioUrl })
      transcript = tr.transcript || ''
      transcriberProvider = tr.provider
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'transcription_failed'
      transcriptionError = msg
      // fail-safe: continue with empty transcript
    }

    // Score + feedback
    const scored = await scoreAttempt({
      type,
      question,
      transcript,
      audioUrl,
      durationMs,
    })

    // Metrics
    const wpm = Number((scored.meta as any)?.wordsPerMinute ?? 0)
    const fillerRate = Number((scored.meta as any)?.fillerRate ?? 0)

    // Persist attempt
    const scoresJson: Record<string, unknown> = {
      content: scored.content,
      pronunciation: scored.pronunciation,
      fluency: scored.fluency,
      total: scored.total,
      rubric: scored.rubric,
      feedback: scored.feedback,
      meta: {
        ...(scored.meta || {}),
        transcriberProvider,
        ...(transcriptionError ? { transcriptionError } : {}),
      },
    }

    const [attempt] = await db
      .insert(speakingAttempts)
      .values({
        userId,
        questionId,
        type,
        audioUrl,
        transcript,
        scores: scoresJson as any,
        // Extracted score columns for efficient querying
        overallScore: scored.total || null,
        pronunciationScore: scored.pronunciation || null,
        fluencyScore: scored.fluency || null,
        contentScore: scored.content || null,
        durationMs,
        wordsPerMinute: wpm.toString(),
        fillerRate: fillerRate.toString(),
        timings: (timings as any) || {},
      })
      .returning()

    return NextResponse.json(
      {
        attempt,
        feedback: scored.feedback,
      } as { attempt: SpeakingAttempt; feedback?: any },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/speaking/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// GET /api/speaking/attempts?questionId=<id>&page=1&pageSize=25
/**
 * List speaking attempts for the authenticated user, optionally filtered by question and paginated.
 *
 * Supports query parameters:
 * - `questionId` — optional filter for a specific question
 * - `page` — page number, minimum 1 (defaults to 1)
 * - `pageSize` — items per page, clamped between 1 and 100 (defaults to 25)
 *
 * @returns An object with `items` (array of SpeakingAttempt), `count` (total matching attempts), `page`, and `pageSize`.
 */
export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    const url = new URL(request.url)
    const questionId = url.searchParams.get('questionId') || undefined
    const page = Math.max(
      parseInt(url.searchParams.get('page') || '1', 10) || 1,
      1
    )
    const pageSize = Math.min(
      Math.max(parseInt(url.searchParams.get('pageSize') || '25', 10) || 25, 1),
      100
    )

    const offset = (page - 1) * pageSize

    const { items, total } = await listSpeakingAttemptsByUser(userId, {
      questionId,
      limit: pageSize,
      offset,
    })

    return NextResponse.json(
      {
        items,
        count: total,
        page,
        pageSize,
      } as { items: SpeakingAttempt[]; count: number; page: number; pageSize: number },
      { status: 200 }
    )
  } catch (e) {
    console.error('[GET /api/speaking/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
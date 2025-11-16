import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { speakingAttempts, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

/**
 * GET /api/speaking/questions/[id]/public-answers
 *
 * Fetch public (community-shared) answers for a specific speaking question.
 * Allows students to see high-scoring examples from other users.
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - pageSize: number (default: 10, max: 50)
 * - minScore: number (default: 0) - minimum total score to filter
 * - sortBy: 'score' | 'recent' (default: 'score')
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') || '10'))
    )
    const minScore = parseInt(searchParams.get('minScore') || '0')
    const sortBy = searchParams.get('sortBy') || 'score'

    const { id: questionId } = context.params

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * pageSize

    // Fetch public attempts for this question with user information
    const publicAnswers = await db
      .select({
        id: speakingAttempts.id,
        userId: speakingAttempts.userId,
        userName: users.name,
        audioUrl: speakingAttempts.audioUrl,
        transcript: speakingAttempts.transcript,
        scores: speakingAttempts.scores,
        durationMs: speakingAttempts.durationMs,
        wordsPerMinute: speakingAttempts.wordsPerMinute,
        fillerRate: speakingAttempts.fillerRate,
        createdAt: speakingAttempts.createdAt,
      })
      .from(speakingAttempts)
      .leftJoin(users, eq(speakingAttempts.userId, users.id))
      .where(
        and(
          eq(speakingAttempts.questionId, questionId),
          eq(speakingAttempts.isPublic, true)
        )
      )
      .orderBy(
        sortBy === 'recent'
          ? desc(speakingAttempts.createdAt)
          : desc(speakingAttempts.scores) // Will sort by total score in JSON
      )
      .limit(pageSize)
      .offset(offset)

    // Filter by minimum score (done in-memory since scores is JSONB)
    const filteredAnswers = publicAnswers
      .filter((answer) => {
        const scores = answer.scores as any
        const total = scores?.total || 0
        return total >= minScore
      })
      .map((answer) => ({
        ...answer,
        userId: undefined, // Remove actual user ID for privacy
        userName: answer.userName || 'Anonymous', // Show display name only
      }))

    // Get total count for pagination
    const totalPublicAnswers = await db
      .select({ count: speakingAttempts.id })
      .from(speakingAttempts)
      .where(
        and(
          eq(speakingAttempts.questionId, questionId),
          eq(speakingAttempts.isPublic, true)
        )
      )

    const total = totalPublicAnswers.length

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      answers: filteredAnswers,
    })
  } catch (error: any) {
    console.error('Error fetching public answers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public answers', details: error.message },
      { status: 500 }
    )
  }
}

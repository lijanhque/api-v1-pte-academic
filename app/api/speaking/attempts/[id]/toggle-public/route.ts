import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { speakingAttempts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

/**
 * PATCH /api/speaking/attempts/[id]/toggle-public
 *
 * Toggle the public visibility of a speaking attempt.
 * Only the attempt owner can toggle their own attempts.
 *
 * Body:
 * - isPublic: boolean
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: attemptId } = context.params
    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isPublic } = body

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      )
    }

    // Verify the attempt belongs to the current user
    const [attempt] = await db
      .select()
      .from(speakingAttempts)
      .where(
        and(
          eq(speakingAttempts.id, attemptId),
          eq(speakingAttempts.userId, user.id)
        )
      )
      .limit(1)

    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found or not authorized' },
        { status: 404 }
      )
    }

    // Update the public status
    const [updated] = await db
      .update(speakingAttempts)
      .set({ isPublic })
      .where(eq(speakingAttempts.id, attemptId))
      .returning()

    return NextResponse.json({
      success: true,
      attempt: updated,
      message: isPublic
        ? 'Answer is now public and visible to the community'
        : 'Answer is now private',
    })
  } catch (error: any) {
    console.error('Error toggling public status:', error)
    return NextResponse.json(
      { error: 'Failed to update attempt', details: error.message },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { userScheduledExamDates } from '@/lib/db/schema'

/**
 * Deletes a scheduled exam date belonging to the authenticated user.
 *
 * Attempts to remove the exam date identified by `dateId` for the current session user and returns an HTTP JSON response indicating the outcome.
 *
 * @param request - The incoming Next.js request (unused for body parsing in this handler).
 * @param params - A promise resolving to an object with `dateId`, the ID of the exam date to delete.
 * @returns A NextResponse JSON:
 * - `{ success: true }` with status 200 when deletion succeeds.
 * - `{ error: 'Unauthorized' }` with status 401 when there is no authenticated session.
 * - `{ error: 'Exam date not found' }` with status 404 when the specified date does not exist or does not belong to the user.
 * - `{ error: 'Failed to delete exam date' }` with status 500 for deletion failures or unexpected errors.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dateId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dateId } = await params

    // Ensure user can only delete their own exam dates
    const examDate = await db
      .select()
      .from(userScheduledExamDates)
      .where(
        and(
          eq(userScheduledExamDates.id, dateId),
          eq(userScheduledExamDates.userId, session.user.id)
        )
      )
      .limit(1)

    if (!examDate.length) {
      return NextResponse.json(
        { error: 'Exam date not found' },
        { status: 404 }
      )
    }

    const deleteResult = await db
      .delete(userScheduledExamDates)
      .where(eq(userScheduledExamDates.id, dateId))
      .returning()

    if (!deleteResult || deleteResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete exam date' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exam date:', error)
    return NextResponse.json(
      { error: 'Failed to delete exam date' },
      { status: 500 }
    )
  }
}
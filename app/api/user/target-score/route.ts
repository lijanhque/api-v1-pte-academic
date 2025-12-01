import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/drizzle'
import { userProfiles } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    if (!profile.length) {
      return NextResponse.json({ targetScore: null })
    }

    return NextResponse.json({ targetScore: profile[0].targetScore })
  } catch (error) {
    console.error('Error fetching target score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch target score' },
      { status: 500 }
    )
  }
}

/**
 * Upserts the authenticated user's target score and returns the operation result.
 *
 * @returns A NextResponse containing JSON:
 * - `{ error: 'Unauthorized' }` with status 401 if the user is not authenticated.
 * - `{ error: 'Target score must be between 30 and 90' }` with status 400 if validation fails.
 * - `{ success: true, targetScore }` with status 200 after a successful insert or update.
 * - `{ error: 'Failed to update target score' }` or `{ error: 'Failed to create profile with target score' }` with status 500 on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetScore } = await request.json()

    if (
      typeof targetScore !== 'number' ||
      targetScore < 30 ||
      targetScore > 90
    ) {
      return NextResponse.json(
        { error: 'Target score must be between 30 and 90' },
        { status: 400 }
      )
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    if (existingProfile.length) {
      const updateResult = await db
        .update(userProfiles)
        .set({ targetScore })
        .where(eq(userProfiles.userId, user.id))
        .returning()

      if (!updateResult || updateResult.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update target score' },
          { status: 500 }
        )
      }
    } else {
      const insertResult = await db
        .insert(userProfiles)
        .values({
          userId: user.id,
          targetScore,
        })
        .returning()

      if (!insertResult || insertResult.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create profile with target score' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, targetScore })
  } catch (error) {
    console.error('Error updating target score:', error)
    return NextResponse.json(
      { error: 'Failed to update target score' },
      { status: 500 }
    )
  }
}
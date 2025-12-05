import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db/drizzle'
import { userProfiles, users } from '@/lib/db/schema'

/**
 * Retrieve the authenticated user's profile.
 *
 * @returns A NextResponse containing the user's profile object if found, an empty object if no profile exists, or an error payload with status 401 (unauthorized) or 500 (failed to fetch profile).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    })

    return NextResponse.json(profile || {})
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * Update or create the authenticated user's profile using data from the request body.
 *
 * @param request - NextRequest whose JSON body may include:
 *   - `examDate`: an ISO date string or null/omitted to clear the field
 *   - `targetScore`: a numeric target score or null/omitted to clear the field
 * @returns The updated or created user profile object on success; an error object with an `error` message on failure (`401` when unauthenticated, `500` for server errors).
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { examDate, targetScore } = body

    // Check if profile exists
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    })

    if (existing) {
      // Update existing profile
      const updated = await db
        .update(userProfiles)
        .set({
          examDate: examDate ? new Date(examDate) : null,
          targetScore: targetScore || null,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, session.user.id))
        .returning()

      if (!updated || updated.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }

      return NextResponse.json(updated[0])
    } else {
      // Create new profile
      const created = await db
        .insert(userProfiles)
        .values({
          userId: session.user.id,
          examDate: examDate ? new Date(examDate) : null,
          targetScore: targetScore || null,
        })
        .returning()

      if (!created || created.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      return NextResponse.json(created[0])
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
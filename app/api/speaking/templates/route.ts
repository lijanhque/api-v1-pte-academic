import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { speakingTemplates } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { SpeakingType, Difficulty } from '@/lib/pte/types'

/**
 * GET /api/speaking/templates
 *
 * Fetch sample answer templates for speaking tasks.
 * Provides high-scoring example structures for students to learn from.
 *
 * Query Parameters:
 * - type: SpeakingType (required) - e.g., 'describe_image'
 * - difficulty: Difficulty (optional) - 'Easy', 'Medium', 'Hard'
 * - recommended: boolean (optional) - filter for recommended templates only
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as SpeakingType | null
    const difficulty = searchParams.get('difficulty') as Difficulty | null
    const recommendedParam = searchParams.get('recommended')
    const recommended = recommendedParam === 'true'
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '10'))
    )

    if (!type) {
      return NextResponse.json(
        { error: 'type parameter is required' },
        { status: 400 }
      )
    }

    // Build query conditions
    const conditions = [eq(speakingTemplates.type, type)]

    if (difficulty) {
      conditions.push(eq(speakingTemplates.difficulty, difficulty))
    }

    if (recommended) {
      conditions.push(eq(speakingTemplates.isRecommended, true))
    }

    // Fetch templates
    const templates = await db
      .select()
      .from(speakingTemplates)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(speakingTemplates.isRecommended), desc(speakingTemplates.usageCount))
      .limit(limit)

    return NextResponse.json({
      total: templates.length,
      templates,
    })
  } catch (error: any) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    )
  }
}

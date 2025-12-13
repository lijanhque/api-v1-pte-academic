import 'server-only'

import { db } from '@/lib/db/drizzle'
import { userProgress, speakingAttempts, writingAttempts, readingAttempts, listeningAttempts } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

export type SkillType = 'speaking' | 'writing' | 'reading' | 'listening'

interface SyncOptions {
  userId: string
  skill: SkillType
  score: number
  timeTaken?: number // in seconds
}

/**
 * Calculate the study streak based on last active date.
 * Returns the new streak value.
 */
function calculateStreak(lastActiveAt: Date | null, currentStreak: number): number {
  if (!lastActiveAt) {
    // First time - start streak at 1
    return 1
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActive = new Date(lastActiveAt.getFullYear(), lastActiveAt.getMonth(), lastActiveAt.getDate())

  const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) {
    // Same day - keep current streak
    return currentStreak
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    return currentStreak + 1
  } else {
    // Missed days - reset to 1
    return 1
  }
}

/**
 * Sync user progress after an attempt is submitted.
 * Updates the skill score (rolling average of recent attempts),
 * increments questions answered, and updates last active timestamp.
 */
export async function syncProgressAfterAttempt(options: SyncOptions): Promise<void> {
  const { userId, skill, score, timeTaken } = options

  try {
    // Get or create user progress record
    const existing = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1)

    const now = new Date()
    const studyTimeMinutes = timeTaken ? Math.ceil(timeTaken / 60) : 1

    if (existing.length === 0) {
      // Create new progress record
      const initialValues: Record<string, unknown> = {
        userId,
        questionsAnswered: 1,
        totalStudyTime: studyTimeMinutes,
        lastActiveAt: now,
        studyStreak: 1, // First day of streak
        [`${skill}Score`]: score,
        overallScore: score,
      }

      await db.insert(userProgress).values(initialValues as any)
    } else {
      // Calculate new streak
      const currentProgress = existing[0]
      const newStreak = calculateStreak(currentProgress.lastActiveAt, currentProgress.studyStreak || 0)
      // Calculate new average score for this skill (last 10 attempts)
      const avgScore = await calculateSkillAverage(userId, skill)

      // Build update object
      const updates: Record<string, unknown> = {
        questionsAnswered: sql`${userProgress.questionsAnswered} + 1`,
        totalStudyTime: sql`${userProgress.totalStudyTime} + ${studyTimeMinutes}`,
        lastActiveAt: now,
        studyStreak: newStreak,
        updatedAt: now,
      }

      // Update the specific skill score
      const skillScoreColumn = `${skill}Score` as keyof typeof userProgress
      updates[skillScoreColumn] = avgScore

      // Recalculate overall score as weighted average
      const skillScores = {
        speaking: skill === 'speaking' ? avgScore : (currentProgress.speakingScore || 0),
        writing: skill === 'writing' ? avgScore : (currentProgress.writingScore || 0),
        reading: skill === 'reading' ? avgScore : (currentProgress.readingScore || 0),
        listening: skill === 'listening' ? avgScore : (currentProgress.listeningScore || 0),
      }

      // Calculate overall as average of non-zero scores
      const nonZeroScores = Object.values(skillScores).filter(s => s > 0)
      const overallScore = nonZeroScores.length > 0
        ? Math.round(nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length)
        : 0

      updates.overallScore = overallScore

      await db
        .update(userProgress)
        .set(updates as any)
        .where(eq(userProgress.userId, userId))
    }
  } catch (error) {
    // Log but don't throw - progress sync should not break the main flow
    console.error('[syncProgressAfterAttempt] Error:', error)
  }
}

/**
 * Calculate the average score for a skill from the last 10 attempts
 */
async function calculateSkillAverage(userId: string, skill: SkillType): Promise<number> {
  let attempts: { overallScore: number | null }[] = []

  try {
    switch (skill) {
      case 'speaking':
        attempts = await db
          .select({ overallScore: speakingAttempts.overallScore })
          .from(speakingAttempts)
          .where(eq(speakingAttempts.userId, userId))
          .orderBy(desc(speakingAttempts.createdAt))
          .limit(10)
        break
      case 'writing':
        attempts = await db
          .select({ overallScore: writingAttempts.overallScore })
          .from(writingAttempts)
          .where(eq(writingAttempts.userId, userId))
          .orderBy(desc(writingAttempts.createdAt))
          .limit(10)
        break
      case 'reading':
        attempts = await db
          .select({ overallScore: readingAttempts.overallScore })
          .from(readingAttempts)
          .where(eq(readingAttempts.userId, userId))
          .orderBy(desc(readingAttempts.createdAt))
          .limit(10)
        break
      case 'listening':
        attempts = await db
          .select({ overallScore: listeningAttempts.overallScore })
          .from(listeningAttempts)
          .where(eq(listeningAttempts.userId, userId))
          .orderBy(desc(listeningAttempts.createdAt))
          .limit(10)
        break
    }

    const validScores = attempts
      .map(a => a.overallScore)
      .filter((s): s is number => s !== null && s > 0)

    if (validScores.length === 0) return 0

    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
  } catch (error) {
    console.error('[calculateSkillAverage] Error:', error)
    return 0
  }
}

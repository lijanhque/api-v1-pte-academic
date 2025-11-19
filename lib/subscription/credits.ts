/**
 * AI Credit Management System
 * Handles daily AI scoring credits for users
 */

import { and, eq, gte, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'
import {
  getRemainingAiCredits,
  getTierConfig,
  hasAiCreditsAvailable,
} from './tiers'

export interface CreditStatus {
  total: number // -1 for unlimited
  used: number
  remaining: number // -1 for unlimited
  resetsAt: Date | null
}

/**
 * Check if it's a new day and reset credits if needed
 */
export async function checkAndResetCredits(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()
  const lastReset = user.lastCreditReset || new Date(0)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastResetDate = new Date(
    lastReset.getFullYear(),
    lastReset.getMonth(),
    lastReset.getDate()
  )

  // Reset if it's a new day
  if (today > lastResetDate) {
    await db
      .update(users)
      .set({
        aiCreditsUsed: 0,
        lastCreditReset: now,
      })
      .where(eq(users.id, userId))
  }
}

/**
 * Get current credit status for a user
 */
export async function getCreditStatus(userId: string): Promise<CreditStatus> {
  // Reset credits if needed
  await checkAndResetCredits(userId)

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Use the user's configured dailyAiCredits directly from the database
  const total = user.dailyAiCredits || 4 // Default to 4 if not set
  const used = user.aiCreditsUsed || 0

  // Calculate when credits reset (midnight UTC)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  return {
    total,
    used,
    remaining: total === -1 ? -1 : Math.max(0, total - used),
    resetsAt: total === -1 ? null : tomorrow,
  }
}

/**
 * Use AI credits for scoring
 */
export async function deductAiCredit(
  userId: string,
  count: number = 1
): Promise<boolean> {
  // Check and reset if needed
  await checkAndResetCredits(userId)

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Default to free tier if no subscription tier field exists
  const tier = 'free'
  const currentUsed = user.aiCreditsUsed || 0
  const dailyLimit = user.dailyAiCredits || 10

  // Check if user has enough credits
  // Use -1 for unlimited, otherwise check against the limit
  if (dailyLimit !== -1 && currentUsed + count > dailyLimit) {
    return false
  }

  // Deduct credits
  await db
    .update(users)
    .set({
      aiCreditsUsed: currentUsed + count,
    })
    .where(eq(users.id, userId))

  return true
}

/**
 * Calculate AI credits needed for a question type
 */
export function getCreditsNeeded(questionType: string): number {
  const FREE_QUESTION_TYPES = [
    // Reading - all auto-scored
    'multiple_choice_single',
    'multiple_choice_multiple',
    'reorder_paragraphs',
    'fill_in_blanks',
    'reading_writing_fill_blanks',

    // Listening - MCQ auto-scored
    'multiple_choice_single',
    'multiple_choice_multiple',
    'highlight_correct_summary',
    'select_missing_word',
  ]

  // These don't require AI credits (auto-scored)
  if (FREE_QUESTION_TYPES.includes(questionType)) {
    return 0
  }

  // All speaking and writing require AI
  return 1
}

/**
 * Check if user can use AI scoring for a question
 */
export async function canUseAiScoring(
  userId: string,
  questionType: string
): Promise<{ allowed: boolean; reason?: string }> {
  const creditsNeeded = getCreditsNeeded(questionType)

  // No credits needed for auto-scored questions
  if (creditsNeeded === 0) {
    return { allowed: true }
  }

  const status = await getCreditStatus(userId)

  // Unlimited credits
  if (status.remaining === -1) {
    return { allowed: true }
  }

  // Not enough credits
  if (status.remaining < creditsNeeded) {
    return {
      allowed: false,
      reason: `Not enough AI credits. You have ${status.remaining} remaining. Resets at ${status.resetsAt?.toLocaleTimeString()}.`,
    }
  }

  return { allowed: true }
}

/**
 * Get credit usage stats for analytics
 */
export async function getCreditUsageStats(userId: string, days: number = 7) {
  // This would query ai_credit_logs table to get historical usage
  // For now, return placeholder
  return {
    totalUsed: 0,
    averagePerDay: 0,
    peakDay: 0,
    history: [],
  }
}

/**
 * Middleware helper to check credits before API call
 */
export async function withCreditCheck(
  userId: string,
  questionType: string,
  callback: () => Promise<any>
) {
  const check = await canUseAiScoring(userId, questionType)

  if (!check.allowed) {
    throw new Error(check.reason || 'Insufficient AI credits')
  }

  const creditsNeeded = getCreditsNeeded(questionType)

  if (creditsNeeded > 0) {
    const success = await deductAiCredit(userId, creditsNeeded)
    if (!success) {
      throw new Error('Failed to deduct AI credits')
    }
  }

  return callback()
}

/**
 * Get friendly message about credit status
 */
export function getCreditStatusMessage(status: CreditStatus): string {
  if (status.total === -1) {
    return 'Unlimited AI scoring available'
  }

  if (status.remaining === 0) {
    const resetTime = status.resetsAt
      ? new Date(status.resetsAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'tomorrow'
    return `No AI credits remaining. Resets at ${resetTime}`
  }

  return `${status.remaining} of ${status.total} AI credits remaining today`
}

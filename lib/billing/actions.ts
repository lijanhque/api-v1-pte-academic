'use server'

import { db } from '@/lib/db/drizzle'
import { userSubscriptions, users, aiCreditUsage } from '@/lib/db/schema'
import { eq, and, desc, gte, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Polar } from '@polar-sh/sdk'

// Plan configurations
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    dailyAiCredits: 4,
    features: [
      'Basic practice questions',
      '4 AI scoring per day',
      'Community access',
    ],
  },
  basic: {
    name: 'Basic',
    dailyAiCredits: 20,
    price: 9.99,
    features: [
      'All practice questions',
      '20 AI scoring per day',
      'Community access',
      'Progress tracking',
    ],
  },
  pro: {
    name: 'Pro',
    dailyAiCredits: 100,
    price: 19.99,
    features: [
      'All practice questions',
      '100 AI scoring per day',
      'Community access',
      'Progress tracking',
      'Mock tests',
      'AI coaching',
    ],
  },
  premium: {
    name: 'Premium',
    dailyAiCredits: -1, // unlimited
    price: 49.99,
    features: [
      'All practice questions',
      'Unlimited AI scoring',
      'Community access',
      'Progress tracking',
      'Mock tests',
      'AI coaching',
      'Priority support',
      '1-on-1 sessions',
    ],
  },
} as const

export type PlanType = keyof typeof PLAN_CONFIG

// Get current user's subscription
export async function getUserSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return null
  }

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, session.user.id))
    .limit(1)

  if (!subscription) {
    return {
      planType: 'free' as PlanType,
      status: 'active',
      features: PLAN_CONFIG.free.features,
      dailyAiCredits: PLAN_CONFIG.free.dailyAiCredits,
    }
  }

  const planType = (subscription.planType || 'free') as PlanType
  const config = PLAN_CONFIG[planType] || PLAN_CONFIG.free

  return {
    ...subscription,
    features: config.features,
    dailyAiCredits: config.dailyAiCredits,
  }
}

// Get AI credits usage for today
export async function getAiCreditsStatus() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return null
  }

  const [user] = await db
    .select({
      dailyAiCredits: users.dailyAiCredits,
      aiCreditsUsed: users.aiCreditsUsed,
      lastCreditReset: users.lastCreditReset,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) {
    return null
  }

  // Check if we need to reset daily credits
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset) : null
  const needsReset = !lastReset || lastReset < today

  if (needsReset) {
    // Reset credits for new day
    await db
      .update(users)
      .set({
        aiCreditsUsed: 0,
        lastCreditReset: new Date(),
      })
      .where(eq(users.id, session.user.id))

    return {
      dailyLimit: user.dailyAiCredits,
      used: 0,
      remaining: user.dailyAiCredits,
      unlimited: user.dailyAiCredits === -1,
    }
  }

  return {
    dailyLimit: user.dailyAiCredits,
    used: user.aiCreditsUsed,
    remaining: user.dailyAiCredits === -1 ? -1 : user.dailyAiCredits - user.aiCreditsUsed,
    unlimited: user.dailyAiCredits === -1,
  }
}

// Use an AI credit
export async function useAiCredit(usageType: string, provider: string, model?: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const credits = await getAiCreditsStatus()

  if (!credits) {
    return { success: false, error: 'Could not check credits' }
  }

  if (!credits.unlimited && credits.remaining <= 0) {
    return { success: false, error: 'No AI credits remaining. Upgrade your plan for more.' }
  }

  // Increment usage
  await db
    .update(users)
    .set({
      aiCreditsUsed: sql`${users.aiCreditsUsed} + 1`,
    })
    .where(eq(users.id, session.user.id))

  // Log usage
  await db.insert(aiCreditUsage).values({
    userId: session.user.id,
    usageType: usageType as any,
    provider,
    model,
  })

  return { success: true, remaining: credits.unlimited ? -1 : credits.remaining - 1 }
}

// Get usage history
export async function getUsageHistory(days: number = 30) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return []
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const usage = await db
    .select()
    .from(aiCreditUsage)
    .where(
      and(
        eq(aiCreditUsage.userId, session.user.id),
        gte(aiCreditUsage.createdAt, startDate)
      )
    )
    .orderBy(desc(aiCreditUsage.createdAt))
    .limit(100)

  return usage
}

// Create checkout session for upgrade
export async function createCheckoutSession(tier: 'basic' | 'pro' | 'premium') {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.POLAR_ACCESS_TOKEN) {
    return { success: false, error: 'Payment system not configured' }
  }

  try {
    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    })

    const productIds: Record<string, string> = {
      basic: process.env.POLAR_BASIC_PRODUCT_ID || '',
      pro: process.env.POLAR_PRO_PRODUCT_ID || '506dc992-fde6-478a-8a21-4646d22ea449',
      premium: process.env.POLAR_PREMIUM_PRODUCT_ID || '',
    }

    const productId = productIds[tier]

    if (!productId) {
      return { success: false, error: 'Product not configured for this tier' }
    }

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/success?provider=polar&checkout_id={CHECKOUT_ID}`,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        tier,
      },
    })

    return { success: true, url: checkout.url, id: checkout.id }
  } catch (error) {
    console.error('Checkout creation error:', error)
    return { success: false, error: 'Failed to create checkout session' }
  }
}

// Cancel subscription
export async function cancelSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Update subscription status
    await db
      .update(userSubscriptions)
      .set({
        status: 'cancelled',
        autoRenew: false,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.userId, session.user.id))

    // Reset user to free plan credits at end of billing period
    // The actual downgrade happens when the subscription end date passes

    return { success: true }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return { success: false, error: 'Failed to cancel subscription' }
  }
}

// Check if user has access to a feature
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const subscription = await getUserSubscription()

  if (!subscription) {
    return PLAN_CONFIG.free.features.includes(feature)
  }

  const planType = (subscription.planType || 'free') as PlanType
  const config = PLAN_CONFIG[planType] || PLAN_CONFIG.free

  return config.features.includes(feature)
}

// Update user plan (called from webhook)
export async function updateUserPlan(userId: string, planType: PlanType) {
  const config = PLAN_CONFIG[planType]

  // Update user credits based on plan
  await db
    .update(users)
    .set({
      dailyAiCredits: config.dailyAiCredits,
      aiCreditsUsed: 0,
      lastCreditReset: new Date(),
    })
    .where(eq(users.id, userId))

  return { success: true }
}

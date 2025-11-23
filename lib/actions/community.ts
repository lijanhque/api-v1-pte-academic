'use server'

import { db } from '@/lib/db'
import { speakingAttempts, speakingQuestions, users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { desc, eq, sql, and } from 'drizzle-orm'

export type SpeakingType = 'read_aloud' | 'repeat_sentence' | 'describe_image' | 'retell_lecture' | 'answer_short_question'

export async function getAllAttempts(options: {
    page?: number
    limit?: number
    type?: SpeakingType
    sortBy?: 'recent' | 'top_score'
} = {}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const { page = 1, limit = 20, type, sortBy = 'recent' } = options
    const offset = (page - 1) * limit

    // Build where clause
    const whereClauses = type ? eq(speakingAttempts.type, type) : undefined

    // Get total count
    const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(speakingAttempts)
        .where(whereClauses)

    // Get attempts with user and question data
    const attempts = await db
        .select({
            id: speakingAttempts.id,
            userId: speakingAttempts.userId,
            questionId: speakingAttempts.questionId,
            type: speakingAttempts.type,
            audioUrl: speakingAttempts.audioUrl,
            transcript: speakingAttempts.transcript,
            scores: speakingAttempts.scores,
            durationMs: speakingAttempts.durationMs,
            createdAt: speakingAttempts.createdAt,
            // User data
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
            // Question data
            questionTitle: speakingQuestions.title,
            questionType: speakingQuestions.type,
            questionDifficulty: speakingQuestions.difficulty,
        })
        .from(speakingAttempts)
        .leftJoin(users, eq(speakingAttempts.userId, users.id))
        .leftJoin(speakingQuestions, eq(speakingAttempts.questionId, speakingQuestions.id))
        .where(whereClauses)
        .orderBy(
            sortBy === 'top_score'
                ? desc(sql`(${speakingAttempts.scores}->>'overall_score')::int`)
                : desc(speakingAttempts.createdAt)
        )
        .limit(limit)
        .offset(offset)

    return {
        attempts,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
    }
}

export async function getUserPublicAttempts(userId: string, limit: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const attempts = await db
        .select({
            id: speakingAttempts.id,
            type: speakingAttempts.type,
            audioUrl: speakingAttempts.audioUrl,
            scores: speakingAttempts.scores,
            createdAt: speakingAttempts.createdAt,
            questionTitle: speakingQuestions.title,
            questionDifficulty: speakingQuestions.difficulty,
        })
        .from(speakingAttempts)
        .leftJoin(speakingQuestions, eq(speakingAttempts.questionId, speakingQuestions.id))
        .where(eq(speakingAttempts.userId, userId))
        .orderBy(desc(speakingAttempts.createdAt))
        .limit(limit)

    return attempts
}

export async function getTopAttempts(limit: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const attempts = await db
        .select({
            id: speakingAttempts.id,
            userId: speakingAttempts.userId,
            type: speakingAttempts.type,
            audioUrl: speakingAttempts.audioUrl,
            scores: speakingAttempts.scores,
            createdAt: speakingAttempts.createdAt,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
            questionTitle: speakingQuestions.title,
            questionDifficulty: speakingQuestions.difficulty,
        })
        .from(speakingAttempts)
        .leftJoin(users, eq(speakingAttempts.userId, users.id))
        .leftJoin(speakingQuestions, eq(speakingAttempts.questionId, speakingQuestions.id))
        .orderBy(desc(sql`(${speakingAttempts.scores}->>'overall_score')::int`))
        .limit(limit)

    return attempts
}

export async function getCommunityStats() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const [stats] = await db
        .select({
            totalAttempts: sql<number>`COUNT(*)`,
            totalUsers: sql<number>`COUNT(DISTINCT ${speakingAttempts.userId})`,
            avgScore: sql<number>`AVG((${speakingAttempts.scores}->>'overall_score')::int)`,
        })
        .from(speakingAttempts)

    return stats
}

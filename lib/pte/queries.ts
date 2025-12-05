import { db } from '@/lib/db/drizzle';
import { speakingQuestions, speakingAttempts, writingAttempts } from '@/lib/db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Retrieve a speaking question by its identifier.
 *
 * @param id - The speaking question's unique identifier
 * @returns The speaking question object if found, `undefined` otherwise
 */
export async function getSpeakingQuestionById(id: string) {
  const question = await db.select().from(speakingQuestions).where(eq(speakingQuestions.id, id));
  return question[0];
}

/**
 * Retrieve a paginated list of speaking attempts for a user, optionally filtered by question.
 *
 * @param userId - The ID of the user whose speaking attempts to list
 * @param options.limit - Maximum number of attempts to return (default 25)
 * @param options.offset - Number of attempts to skip for pagination (default 0)
 * @param options.questionId - Optional question ID to filter attempts to a specific question
 * @returns An object with `items`, the array of matching speaking attempts, and `total`, the total count of matching attempts
 */
export async function listSpeakingAttemptsByUser(userId: string, { limit = 25, offset = 0, questionId }: { limit?: number, offset?: number, questionId?: string }) {
  const where = questionId ? and(eq(speakingAttempts.userId, userId), eq(speakingAttempts.questionId, questionId)) : eq(speakingAttempts.userId, userId);
  const attempts = await db.select().from(speakingAttempts).where(where).limit(limit).offset(offset);
  const total = await db.select({ count: sql<number>`count(*)` }).from(speakingAttempts).where(where);
  return { items: attempts, total: total[0].count };
}

/**
 * Retrieve the currently authenticated user from the active session.
 *
 * @returns The session's `user` object if a session exists, `undefined` otherwise.
 */
export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
}

/**
 * Returns usage counts for the Speaking and Writing features.
 *
 * @returns An array with two objects: `{ name: 'Speaking', value: <number> }` and `{ name: 'Writing', value: <number> }` where `value` is the total count of attempts for that feature.
 */
export async function getFeatureStats() {
  const speakingCount = await db.select({ value: count() }).from(speakingAttempts);
  const writingCount = await db.select({ value: count() }).from(writingAttempts);

  return [
    { name: 'Speaking', value: speakingCount[0].value },
    { name: 'Writing', value: writingCount[0].value },
  ];
}
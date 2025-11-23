import { sql } from 'drizzle-orm';
import {
    boolean,
    decimal,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

// Enums
export const speakingTypeEnum = pgEnum('speaking_type', [
    'read_aloud',
    'repeat_sentence',
    'describe_image',
    'retell_lecture',
    'answer_short_question',
    'summarize_group_discussion',
    'respond_to_a_situation',
]);

// Speaking Attempts Table (for AI scoring)
export const speakingAttempts = pgTable(
    'speaking_attempts',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: text('user_id').notNull(),
        questionId: uuid('question_id').notNull(),
        type: speakingTypeEnum('type').notNull(),
        audioUrl: text('audio_url').notNull(),
        transcript: text('transcript'),
        referenceText: text('reference_text'), // Added for scoring reference
        questionType: text('question_type'), // Added for compatibility
        scores: jsonb('scores')
            .notNull()
            .default(sql`'{}'::jsonb`),
        aiScores: jsonb('ai_scores'), // AI-generated scores
        status: text('status').default('pending'), // pending, processing, scored
        scoredAt: timestamp('scored_at'),
        durationMs: integer('duration_ms').notNull(),
        wordsPerMinute: decimal('words_per_minute', { precision: 6, scale: 2 }),
        fillerRate: decimal('filler_rate', { precision: 6, scale: 3 }),
        timings: jsonb('timings').notNull(),
        isPublic: boolean('is_public').notNull().default(false),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => ({
        idxQuestion: index('idx_speaking_attempts_question').on(table.questionId),
        idxUserType: index('idx_speaking_attempts_user_type').on(
            table.userId,
            table.type
        ),
        idxPublic: index('idx_speaking_attempts_public').on(table.isPublic),
        idxStatus: index('idx_speaking_attempts_status').on(table.status),
    })
);

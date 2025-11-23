import { CronConfig, Handlers } from 'motia';
import { db } from '../lib/db';
import { speakingAttempts } from '../lib/db/schema';
import { isNull } from 'drizzle-orm';

export const config: CronConfig = {
    type: 'cron',
    name: 'batch-scoring',
    description: 'Process unscored speaking attempts in batches',
    schedule: '*/5 * * * *', // Every 5 minutes
    emits: ['scoring.requested'],
    flows: ['batch-processing']
};

export const handler: Handlers['batch-scoring'] = async (input, { emit, logger }) => {
    logger.info('Starting batch scoring job');

    try {
        // Find unscored attempts
        const unscoredAttempts = await db
            .select()
            .from(speakingAttempts)
            .where(isNull(speakingAttempts.aiScores))
            .limit(10);

        logger.info(`Found ${unscoredAttempts.length} unscored attempts`);

        // Trigger scoring for each
        for (const attempt of unscoredAttempts) {
            await emit({
                topic: 'scoring.requested',
                data: {
                    attemptId: attempt.id,
                    audioUrl: attempt.audioUrl,
                    transcript: attempt.transcript,
                    questionType: attempt.questionType,
                    referenceText: attempt.referenceText
                }
            });
        }

        logger.info('Batch scoring job completed', { processed: unscoredAttempts.length });
    } catch (error) {
        logger.error('Batch scoring job failed', { error });
        throw error;
    }
};

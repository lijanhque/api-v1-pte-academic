import { EventConfig, Handlers } from 'motia';
import { db } from '../lib/db';
import { speakingAttempts } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

export const config: EventConfig = {
    type: 'event',
    name: 'save-scores',
    description: 'Save AI scores to database when scoring completes',
    subscribes: ['scoring.completed'],
    flows: ['speaking-assessment']
};

export const handler: Handlers['save-scores'] = async (input, { logger }) => {
    const { attemptId, scores } = input;

    logger.info('Saving scores to database', { attemptId });

    try {
        await db
            .update(speakingAttempts)
            .set({
                aiScores: scores,
                scoredAt: new Date(),
                status: 'scored'
            })
            .where(eq(speakingAttempts.id, attemptId));

        logger.info('Scores saved successfully', { attemptId });
    } catch (error) {
        logger.error('Failed to save scores', { attemptId, error });
        throw error;
    }
};

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

// Configuration for AI scoring API endpoint
export const config: ApiRouteConfig = {
    type: 'api',
    name: 'ai-scoring',
    path: '/api/score/speaking',
    method: 'POST',
    description: 'AI-powered speaking assessment using Google Gemini',
    emits: ['scoring.completed', 'scoring.failed'],
    flows: ['speaking-assessment']
};

const ScoringInputSchema = z.object({
    audioUrl: z.string().url(),
    transcript: z.string(),
    questionType: z.enum(['read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question']),
    referenceText: z.string().optional(),
    attemptId: z.string()
});

const ScoringOutputSchema = z.object({
    pronunciation: z.number().min(0).max(90),
    fluency: z.number().min(0).max(90),
    content: z.number().min(0).max(90),
    overallScore: z.number().min(0).max(90),
    feedback: z.object({
        strengths: z.array(z.string()),
        improvements: z.array(z.string()),
        detailedAnalysis: z.string()
    })
});

export const handler: Handlers['ai-scoring'] = async (req, { emit, logger, state }) => {
    try {
        const input = ScoringInputSchema.parse(await req.json());

        logger.info('Starting AI scoring', { attemptId: input.attemptId });

        // Store attempt in state for tracking
        await state.set(`scoring:${input.attemptId}`, {
            status: 'processing',
            startedAt: new Date().toISOString()
        });

        // Generate AI scoring using Google Gemini
        const { object: scores } = await generateObject({
            model: google('gemini-2.0-flash-exp'),
            schema: ScoringOutputSchema,
            prompt: `Analyze this PTE speaking attempt:
        Type: ${input.questionType}
        Transcript: ${input.transcript}
        ${input.referenceText ? `Reference: ${input.referenceText}` : ''}
        
        Provide detailed scoring for pronunciation (0-90), fluency (0-90), and content (0-90).
        Also calculate an overall score and provide constructive feedback with strengths and areas for improvement.`
        });

        // Update state
        await state.set(`scoring:${input.attemptId}`, {
            status: 'completed',
            scores,
            completedAt: new Date().toISOString()
        });

        // Emit completion event for downstream processing
        await emit({
            topic: 'scoring.completed',
            data: {
                attemptId: input.attemptId,
                scores,
                timestamp: new Date().toISOString()
            }
        });

        logger.info('Scoring completed successfully', { attemptId: input.attemptId });

        return {
            status: 200,
            body: { success: true, scores }
        };

    } catch (error) {
        logger.error('Scoring failed', { error });

        await emit({
            topic: 'scoring.failed',
            data: {
                attemptId: (error as any).attemptId || 'unknown',
                error: (error as Error).message
            }
        });

        return {
            status: 500,
            body: { success: false, error: (error as Error).message }
        };
    }
};

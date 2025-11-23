/**
 * Motia Client for Next.js Frontend
 * Handles communication with the Motia backend service
 */

export interface ScoringRequest {
    audioUrl: string;
    transcript: string;
    questionType: 'read_aloud' | 'repeat_sentence' | 'describe_image' | 'retell_lecture' | 'answer_short_question';
    referenceText?: string;
    attemptId: string;
}

export interface ScoringResponse {
    success: boolean;
    scores?: {
        pronunciation: number;
        fluency: number;
        content: number;
        overallScore: number;
        feedback: {
            strengths: string[];
            improvements: string[];
            detailedAnalysis: string;
        };
    };
    error?: string;
}

export interface ScoringStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    scores?: ScoringResponse['scores'];
    startedAt?: string;
    completedAt?: string;
}

export class MotiaClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_MOTIA_BACKEND_URL || 'http://localhost:3001';
    }

    /**
     * Submit a speaking attempt for AI scoring
     */
    async scoreSpeaking(data: ScoringRequest): Promise<ScoringResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/score/speaking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Scoring failed: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Motia scoring error:', error);
            throw error;
        }
    }

    /**
     * Get the status of a scoring attempt
     */
    async getScoringStatus(attemptId: string): Promise<ScoringStatus> {
        try {
            const response = await fetch(`${this.baseUrl}/api/score/status/${attemptId}`);

            if (!response.ok) {
                throw new Error(`Failed to get scoring status: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Failed to get scoring status:', error);
            throw error;
        }
    }

    /**
     * Health check for Motia backend
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error('Motia backend health check failed:', error);
            return false;
        }
    }
}

// Singleton instance
export const motiaClient = new MotiaClient();

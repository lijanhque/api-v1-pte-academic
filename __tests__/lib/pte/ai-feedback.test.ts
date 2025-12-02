/**
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock OpenAI before imports
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

describe('AI Feedback Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateAIFeedback', () => {
    it('should fall back to mock feedback when API key is not set', async () => {
      process.env.OPENAI_API_KEY = 'your_openai_api_key'; // placeholder value

      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');
      const { QuestionType, TestSection } = await import('@/lib/pte/types');

      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        'This is a test essay with more than fifty words to ensure proper scoring. ' +
        'The essay discusses various topics and provides adequate detail. ' +
        'It demonstrates writing ability through proper structure and content.'
      );

      expect(feedback).toHaveProperty('overallScore');
      expect(feedback.overallScore).toBeGreaterThan(0);
    });

    it('should route to writing feedback for WRITING section', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        'Test essay content with sufficient words to pass minimum requirements. ' +
        'This essay demonstrates basic writing skills and content organization. ' +
        'Multiple sentences are included to reach word count threshold.'
      );

      expect(feedback).toHaveProperty('content');
      expect(feedback).toHaveProperty('grammar');
      expect(feedback).toHaveProperty('vocabulary');
      expect(feedback).toHaveProperty('spelling');
    });

    it('should route to speaking feedback for SPEAKING section', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'describe_image' as any,
        'SPEAKING' as any,
        'The image shows various data points and trends over time. ' +
        'There are multiple categories displayed in the chart.'
      );

      expect(feedback).toHaveProperty('pronunciation');
      expect(feedback).toHaveProperty('fluency');
      expect(feedback).toHaveProperty('content');
    });

    it('should generate basic feedback for other sections', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'multiple_choice_single' as any,
        'READING' as any,
        'answer A',
        'answer A'
      );

      expect(feedback).toHaveProperty('overallScore');
      expect(feedback.overallScore).toBe(100);
    });
  });

  describe('Writing Feedback Generation', () => {
    it('should score based on word count', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const shortEssay = 'This is too short.';
      const longEssay = 'This is a comprehensive essay that discusses multiple perspectives on the topic. ' +
        'It provides detailed analysis and examples to support the main arguments. ' +
        'The essay demonstrates strong writing skills through proper organization and clear expression of ideas. ' +
        'Additional paragraphs expand on the central theme with relevant supporting details. ' +
        'The conclusion ties together all the main points effectively. ' +
        'Throughout the essay, appropriate vocabulary and grammar are employed consistently. ' +
        'Transition words help maintain coherence between paragraphs and sentences. ' +
        'The overall structure follows academic writing conventions properly. ' +
        'Citations and references would typically appear in formal academic essays. ' +
        'This extended content demonstrates the ability to write at length on complex topics.';

      const shortFeedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, shortEssay);
      const longFeedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, longEssay);

      expect(shortFeedback.content!.score).toBeLessThan(longFeedback.content!.score);
    });

    it('should provide constructive feedback for short essays', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const shortEssay = 'Very brief content here.';
      const feedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, shortEssay);

      expect(feedback.content!.feedback).toContain('too short');
    });

    it('should calculate sentence-based metrics', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const essay = 'First sentence here. Second sentence follows. Third adds more detail. ' +
        'Fourth sentence continues. Fifth provides conclusion.';
      
      const feedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, essay);

      expect(feedback).toHaveProperty('content');
      expect(feedback).toHaveProperty('grammar');
      expect(feedback).toHaveProperty('vocabulary');
    });

    it('should include helpful suggestions', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const essay = 'Sample essay content with adequate length for evaluation purposes. ' +
        'This demonstrates writing capability through proper sentence construction.';

      const feedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, essay);

      expect(feedback.suggestions).toBeDefined();
      expect(feedback.suggestions!.length).toBeGreaterThan(0);
    });

    it('should identify strengths', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const goodEssay = 'This essay presents a well-structured argument with clear main ideas. ' +
        'Supporting details are provided throughout multiple paragraphs. ' +
        'The writing demonstrates coherence and logical progression of thoughts.';

      const feedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, goodEssay);

      expect(feedback.strengths).toBeDefined();
      expect(feedback.strengths!.length).toBeGreaterThan(0);
    });

    it('should identify areas for improvement', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const essay = 'Basic essay content here. More content added. Final thoughts included.';
      const feedback = await generateAIFeedback('write_essay' as any, 'WRITING' as any, essay);

      expect(feedback.areasForImprovement).toBeDefined();
      expect(feedback.areasForImprovement!.length).toBeGreaterThan(0);
    });
  });

  describe('Speaking Feedback Generation', () => {
    it('should score describe image based on word count', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const shortResponse = 'The image shows a chart with data.';
      const longResponse = 'The image displays a comprehensive bar chart showing quarterly sales data ' +
        'across multiple product categories. The highest values appear in quarter four reaching ' +
        'approximately ninety thousand units. Product category A shows consistent growth throughout ' +
        'the year while category B fluctuates significantly. The lowest point occurs in quarter two ' +
        'at around thirty thousand units. Overall trends indicate positive market performance with ' +
        'seasonal variations evident across all categories. Additional data points reveal regional ' +
        'differences in sales distribution and consumer preferences affecting total numbers.';

      const shortFeedback = await generateAIFeedback('describe_image' as any, 'SPEAKING' as any, shortResponse);
      const longFeedback = await generateAIFeedback('describe_image' as any, 'SPEAKING' as any, longResponse);

      expect(longFeedback.content!.score).toBeGreaterThan(shortFeedback.content!.score);
    });

    it('should provide specific feedback for describe image', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const response = 'The chart shows various trends over time with multiple data points displayed.';
      const feedback = await generateAIFeedback('describe_image' as any, 'SPEAKING' as any, response);

      expect(feedback.suggestions).toContain(expect.stringContaining('12+'));
    });

    it('should score pronunciation, fluency, and content separately', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const response = 'The image presents multiple elements requiring detailed description.';
      const feedback = await generateAIFeedback('read_aloud' as any, 'SPEAKING' as any, response);

      expect(feedback.pronunciation).toBeDefined();
      expect(feedback.fluency).toBeDefined();
      expect(feedback.content).toBeDefined();
      expect(feedback.pronunciation!.score).toBeGreaterThan(0);
      expect(feedback.fluency!.score).toBeGreaterThan(0);
      expect(feedback.content!.score).toBeGreaterThan(0);
    });

    it('should calculate weighted overall score', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const response = 'Sample speaking response for evaluation purposes.';
      const feedback = await generateAIFeedback('repeat_sentence' as any, 'SPEAKING' as any, response);

      expect(feedback.overallScore).toBeDefined();
      expect(feedback.overallScore).toBeGreaterThan(0);
      expect(feedback.overallScore).toBeLessThanOrEqual(90);
    });

    it('should provide speaking-specific suggestions', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const response = 'Test speaking response.';
      const feedback = await generateAIFeedback('retell_lecture' as any, 'SPEAKING' as any, response);

      expect(feedback.suggestions).toBeDefined();
      expect(feedback.suggestions!.some(s => 
        s.includes('practice') || s.includes('speaking') || s.includes('pronunciation')
      )).toBe(true);
    });
  });

  describe('Basic Feedback for Objective Questions', () => {
    it('should return 100 for correct answers', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'multiple_choice_single' as any,
        'READING' as any,
        'Option B',
        'Option B'
      );

      expect(feedback.overallScore).toBe(100);
    });

    it('should return 0 for incorrect answers', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'multiple_choice_single' as any,
        'READING' as any,
        'Option A',
        'Option B'
      );

      expect(feedback.overallScore).toBe(0);
    });

    it('should be case-insensitive for comparison', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'multiple_choice_single' as any,
        'READING' as any,
        'option b',
        'Option B'
      );

      expect(feedback.overallScore).toBe(100);
    });

    it('should trim whitespace for comparison', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'multiple_choice_single' as any,
        'READING' as any,
        '  Option B  ',
        'Option B'
      );

      expect(feedback.overallScore).toBe(100);
    });
  });

  describe('Feedback Structure Validation', () => {
    it('should always include overall score', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        'Test content'
      );

      expect(feedback).toHaveProperty('overallScore');
      expect(typeof feedback.overallScore).toBe('number');
    });

    it('should include suggestions array', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        'Test content for evaluation'
      );

      expect(feedback.suggestions).toBeDefined();
      expect(Array.isArray(feedback.suggestions)).toBe(true);
    });

    it('should include strengths array', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'describe_image' as any,
        'SPEAKING' as any,
        'Speaking test response'
      );

      expect(feedback.strengths).toBeDefined();
      expect(Array.isArray(feedback.strengths)).toBe(true);
    });

    it('should include areas for improvement', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'summarize_written_text' as any,
        'WRITING' as any,
        'Summary text here'
      );

      expect(feedback.areasForImprovement).toBeDefined();
      expect(Array.isArray(feedback.areasForImprovement)).toBe(true);
    });
  });

  describe('Score Ranges and Validity', () => {
    it('should return scores within 0-90 range for speaking', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'read_aloud' as any,
        'SPEAKING' as any,
        'Test speaking response content'
      );

      expect(feedback.overallScore).toBeGreaterThanOrEqual(0);
      expect(feedback.overallScore).toBeLessThanOrEqual(90);
      
      if (feedback.pronunciation) {
        expect(feedback.pronunciation.score).toBeGreaterThanOrEqual(0);
        expect(feedback.pronunciation.score).toBeLessThanOrEqual(90);
      }
    });

    it('should return valid scores for writing', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        'Essay content for scoring validation and testing purposes'
      );

      expect(feedback.overallScore).toBeGreaterThanOrEqual(0);
      expect(feedback.overallScore).toBeLessThanOrEqual(100);
    });

    it('should provide consistent scores for similar content', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const content = 'This is a test response with consistent content for evaluation.';
      
      const feedback1 = await generateAIFeedback('write_essay' as any, 'WRITING' as any, content);
      const feedback2 = await generateAIFeedback('write_essay' as any, 'WRITING' as any, content);

      // Scores should be similar (within reasonable variance due to randomness)
      expect(Math.abs(feedback1.overallScore - feedback2.overallScore)).toBeLessThan(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty responses', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        ''
      );

      expect(feedback).toHaveProperty('overallScore');
      expect(feedback.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long responses', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const longContent = 'word '.repeat(1000);
      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        longContent
      );

      expect(feedback).toHaveProperty('overallScore');
      expect(feedback.overallScore).toBeGreaterThan(0);
    });

    it('should handle special characters', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const content = 'Test with special chars: @#$%^&*()[]{}!? and more content here.';
      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        content
      );

      expect(feedback).toHaveProperty('overallScore');
    });

    it('should handle unicode characters', async () => {
      const { generateAIFeedback } = await import('@/lib/pte/ai-feedback');

      const content = 'Content with émojis 🎯 and spëcial chàracters like ñ, ü, ç.';
      const feedback = await generateAIFeedback(
        'write_essay' as any,
        'WRITING' as any,
        content
      );

      expect(feedback).toHaveProperty('overallScore');
    });
  });
});
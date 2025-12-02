/**
 * Unit tests for lib/ai/orchestrator.ts
 * Tests AI scoring orchestration and prompt generation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}))

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(),
}))

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { scoreWithOrchestrator, type ScoreInput } from '@/lib/ai/orchestrator'

describe('lib/ai/orchestrator', () => {
  const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>
  const mockGoogle = google as jest.MockedFunction<typeof google>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-api-key'
    mockGoogle.mockReturnValue('mocked-model' as any)
  })

  afterEach(() => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
  })

  describe('scoreWithOrchestrator', () => {
    it('should throw error when API key is not configured', async () => {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY

      const input: ScoreInput = {
        type: 'read_aloud',
        transcript: 'test transcript',
      }

      await expect(scoreWithOrchestrator(input, 'speaking')).rejects.toThrow(
        'GOOGLE_GENERATIVE_AI_API_KEY not configured'
      )
    })

    it('should score reading section with correct schema', async () => {
      const input: ScoreInput = {
        type: 'multiple_choice',
        userResponse: 'A',
        promptText: 'What is the answer?',
        options: { A: 'Option A', B: 'Option B' },
        answerKey: 'A',
      }

      mockGenerateObject.mockResolvedValue({
        object: {
          overall: 85,
          subscores: { accuracy: 90, comprehension: 85, vocabulary: 80 },
          mistakes: [],
          rationale: 'Good answer',
          suggestions: ['Keep practicing'],
        },
      } as any)

      const result = await scoreWithOrchestrator(input, 'reading')

      expect(mockGenerateObject).toHaveBeenCalled()
      expect(result.overall).toBe(85)
      expect(result.subscores).toHaveProperty('accuracy')
    })

    it('should score writing section with correct schema', async () => {
      const input: ScoreInput = {
        type: 'essay',
        userResponse: 'This is my essay content...',
        promptText: 'Write about education',
      }

      mockGenerateObject.mockResolvedValue({
        object: {
          overall: 75,
          subscores: { content: 80, grammar: 75, vocabulary: 70, spelling: 75 },
          mistakes: ['Minor grammar issues'],
          rationale: 'Good essay structure',
          suggestions: ['Improve grammar'],
        },
      } as any)

      const result = await scoreWithOrchestrator(input, 'writing')

      expect(result.overall).toBe(75)
      expect(result.subscores).toHaveProperty('grammar')
      expect(result.subscores).toHaveProperty('spelling')
    })

    it('should score speaking section with correct schema', async () => {
      const input: ScoreInput = {
        type: 'read_aloud',
        transcript: 'This is what I said',
        promptText: 'Read this text',
      }

      mockGenerateObject.mockResolvedValue({
        object: {
          overall: 70,
          subscores: { content: 75, pronunciation: 70, fluency: 65 },
          mistakes: ['Some pronunciation errors'],
          rationale: 'Decent pronunciation',
          suggestions: ['Work on fluency'],
        },
      } as any)

      const result = await scoreWithOrchestrator(input, 'speaking')

      expect(result.overall).toBe(70)
      expect(result.subscores).toHaveProperty('pronunciation')
      expect(result.subscores).toHaveProperty('fluency')
    })

    it('should score listening section with correct schema', async () => {
      const input: ScoreInput = {
        type: 'summarize_spoken',
        transcript: 'Audio transcript',
        options: { A: 'Summary A', B: 'Summary B' },
        answerKey: 'A',
      }

      mockGenerateObject.mockResolvedValue({
        object: {
          overall: 80,
          subscores: { accuracy: 85, comprehension: 75 },
          mistakes: [],
          rationale: 'Good comprehension',
          suggestions: [],
        },
      } as any)

      const result = await scoreWithOrchestrator(input, 'listening')

      expect(result.overall).toBe(80)
      expect(result.subscores).toHaveProperty('accuracy')
      expect(result.subscores).toHaveProperty('comprehension')
    })

    it('should use pro model for speaking section', async () => {
      const input: ScoreInput = {
        type: 'read_aloud',
        transcript: 'test',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input, 'speaking')

      expect(mockGoogle).toHaveBeenCalledWith('models/gemini-1.5-pro-latest')
    })

    it('should use pro model for listening section', async () => {
      const input: ScoreInput = {
        type: 'summarize_spoken',
        transcript: 'test',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input, 'listening')

      expect(mockGoogle).toHaveBeenCalledWith('models/gemini-1.5-pro-latest')
    })

    it('should use flash model for reading section', async () => {
      const input: ScoreInput = {
        type: 'multiple_choice',
        userResponse: 'A',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 80, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input, 'reading')

      expect(mockGoogle).toHaveBeenCalledWith('models/gemini-1.5-flash-latest')
    })

    it('should handle old payload format', async () => {
      const input: any = {
        type: 'test',
        payload: {
          question: 'Old format question',
          options: { A: 'Option A' },
          correct: 'A',
        },
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input, 'reading')

      expect(mockGenerateObject).toHaveBeenCalled()
    })

    it('should default to reading section when not specified', async () => {
      const input: ScoreInput = {
        type: 'test',
        userResponse: 'answer',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input)

      expect(mockGoogle).toHaveBeenCalledWith('models/gemini-1.5-flash-latest')
    })

    it('should handle generateObject errors', async () => {
      const input: ScoreInput = {
        type: 'test',
        userResponse: 'answer',
      }

      mockGenerateObject.mockRejectedValue(new Error('AI API error'))

      await expect(scoreWithOrchestrator(input, 'reading')).rejects.toThrow(
        'Failed to score reading attempt'
      )
    })

    it('should set temperature to 0.1', async () => {
      const input: ScoreInput = {
        type: 'test',
        userResponse: 'answer',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input, 'reading')

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.1,
        })
      )
    })

    it('should handle missing subscores gracefully', async () => {
      const input: ScoreInput = {
        type: 'test',
        userResponse: 'answer',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70 },
      } as any)

      const result = await scoreWithOrchestrator(input, 'reading')

      expect(result.overall).toBe(70)
      expect(result.subscores).toEqual({})
    })

    it('should handle missing overall score', async () => {
      const input: ScoreInput = {
        type: 'test',
        userResponse: 'answer',
      }

      mockGenerateObject.mockResolvedValue({
        object: { subscores: { accuracy: 80 } },
      } as any)

      const result = await scoreWithOrchestrator(input, 'reading')

      expect(result.overall).toBe(0)
    })

    it('should prefer section from parameter over input property', async () => {
      const input: any = {
        type: 'test',
        section: 'reading',
      }

      mockGenerateObject.mockResolvedValue({
        object: { overall: 70, subscores: {} },
      } as any)

      await scoreWithOrchestrator(input, 'speaking')

      expect(mockGoogle).toHaveBeenCalledWith('models/gemini-1.5-pro-latest')
    })
  })
})
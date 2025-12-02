/**
 * Unit tests for lib/ai/scoring.ts
 * Tests read aloud AI scoring functionality
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}))

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(),
}))

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { scoreReadAloud } from '@/lib/ai/scoring'

describe('lib/ai/scoring', () => {
  const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>
  const mockGoogle = google as jest.MockedFunction<typeof google>

  beforeEach(() => {
    jest.clearAllMocks()
    mockGoogle.mockReturnValue('mocked-model' as any)
  })

  describe('scoreReadAloud', () => {
    it('should score read aloud attempt successfully', async () => {
      const mockScore = {
        overall_score: 75,
        breakdown: {
          content: 80,
          pronunciation: 75,
          fluency: 70,
        },
        feedback: 'Good attempt with minor issues',
        suggestions: ['Improve pacing', 'Work on pronunciation'],
        transcript_analysis: [
          { word: 'hello', status: 'correct' as const },
          { word: 'world', status: 'correct' as const },
        ],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      const result = await scoreReadAloud(
        'Hello world, this is a test.',
        'Hello world this is a test',
        5000
      )

      expect(result).toEqual(mockScore)
      expect(result.overall_score).toBe(75)
      expect(result.breakdown.content).toBe(80)
    })

    it('should pass correct prompt with all parameters', async () => {
      const mockScore = {
        overall_score: 70,
        breakdown: { content: 70, pronunciation: 70, fluency: 70 },
        feedback: 'Test feedback',
        suggestions: [],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      await scoreReadAloud('Test prompt text', 'Test transcript', 3000)

      expect(mockGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('Test prompt text'),
        })
      )

      const call = mockGenerateObject.mock.calls[0][0]
      expect(call.prompt).toContain('Test transcript')
      expect(call.prompt).toContain('3 seconds')
    })

    it('should use gemini-1.5-flash model', async () => {
      const mockScore = {
        overall_score: 70,
        breakdown: { content: 70, pronunciation: 70, fluency: 70 },
        feedback: '',
        suggestions: [],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      await scoreReadAloud('prompt', 'transcript', 1000)

      expect(mockGoogle).toHaveBeenCalledWith('gemini-1.5-flash')
    })

    it('should handle short duration', async () => {
      const mockScore = {
        overall_score: 60,
        breakdown: { content: 60, pronunciation: 60, fluency: 50 },
        feedback: 'Too fast',
        suggestions: ['Slow down'],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      await scoreReadAloud('Test text', 'Test text', 1000)

      const call = mockGenerateObject.mock.calls[0][0]
      expect(call.prompt).toContain('1 seconds')
    })

    it('should handle long duration', async () => {
      const mockScore = {
        overall_score: 65,
        breakdown: { content: 70, pronunciation: 70, fluency: 55 },
        feedback: 'Too slow',
        suggestions: ['Speed up'],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      await scoreReadAloud('Test text', 'Test text', 15000)

      const call = mockGenerateObject.mock.calls[0][0]
      expect(call.prompt).toContain('15 seconds')
    })

    it('should handle errors and rethrow', async () => {
      const error = new Error('AI service unavailable')
      mockGenerateObject.mockRejectedValue(error)

      await expect(
        scoreReadAloud('prompt', 'transcript', 5000)
      ).rejects.toThrow('AI service unavailable')
    })

    it('should log errors before rethrowing', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')

      mockGenerateObject.mockRejectedValue(error)

      await expect(
        scoreReadAloud('prompt', 'transcript', 5000)
      ).rejects.toThrow('Test error')

      expect(consoleSpy).toHaveBeenCalledWith('Error in scoreReadAloud:', error)
      consoleSpy.mockRestore()
    })

    it('should handle empty prompt text', async () => {
      const mockScore = {
        overall_score: 30,
        breakdown: { content: 20, pronunciation: 40, fluency: 30 },
        feedback: 'Missing content',
        suggestions: [],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      await scoreReadAloud('', 'transcript', 5000)

      const call = mockGenerateObject.mock.calls[0][0]
      expect(call.prompt).toContain('""')
    })

    it('should handle empty transcript', async () => {
      const mockScore = {
        overall_score: 10,
        breakdown: { content: 0, pronunciation: 10, fluency: 20 },
        feedback: 'No speech detected',
        suggestions: ['Try again'],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      await scoreReadAloud('Test prompt', '', 5000)

      const call = mockGenerateObject.mock.calls[0][0]
      expect(call.prompt).toContain('""')
    })

    it('should handle complex transcript analysis', async () => {
      const mockScore = {
        overall_score: 65,
        breakdown: { content: 70, pronunciation: 60, fluency: 65 },
        feedback: 'Mixed performance',
        suggestions: ['Focus on omitted words'],
        transcript_analysis: [
          { word: 'The', status: 'correct' as const },
          { word: 'quick', status: 'mispronounced' as const },
          { word: 'brown', status: 'omitted' as const },
          { word: 'fox', status: 'correct' as const },
          { word: 'um', status: 'inserted' as const },
        ],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      const result = await scoreReadAloud(
        'The quick brown fox',
        'The kwik fox um',
        4000
      )

      expect(result.transcript_analysis).toHaveLength(5)
      expect(result.transcript_analysis[1].status).toBe('mispronounced')
      expect(result.transcript_analysis[2].status).toBe('omitted')
      expect(result.transcript_analysis[4].status).toBe('inserted')
    })

    it('should handle score at minimum boundary', async () => {
      const mockScore = {
        overall_score: 10,
        breakdown: { content: 10, pronunciation: 10, fluency: 10 },
        feedback: 'Needs significant improvement',
        suggestions: ['Practice more'],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      const result = await scoreReadAloud('prompt', 'transcript', 5000)

      expect(result.overall_score).toBe(10)
    })

    it('should handle score at maximum boundary', async () => {
      const mockScore = {
        overall_score: 90,
        breakdown: { content: 90, pronunciation: 90, fluency: 90 },
        feedback: 'Excellent performance',
        suggestions: [],
        transcript_analysis: [],
      }

      mockGenerateObject.mockResolvedValue({ object: mockScore } as any)

      const result = await scoreReadAloud('prompt', 'transcript', 5000)

      expect(result.overall_score).toBe(90)
    })
  })
})
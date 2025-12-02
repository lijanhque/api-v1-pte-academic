/**
 * Unit tests for lib/pte/listing-helpers.ts
 * Tests question listing and categorization helpers
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock dependencies
jest.mock('@/lib/parsers', () => ({
  questionListingCache: {
    parse: jest.fn(),
  },
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

import { questionListingCache } from '@/lib/parsers'
import { headers } from 'next/headers'
import {
  fetchListingQuestions,
  getCurrentMonthName,
  getCurrentMonthKey,
  categorizeQuestions,
} from '@/lib/pte/listing-helpers'

describe('lib/pte/listing-helpers', () => {
  const mockQuestionListingCache = questionListingCache as jest.Mocked<typeof questionListingCache>
  const mockHeaders = headers as jest.MockedFunction<typeof headers>

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.PORT
  })

  describe('fetchListingQuestions', () => {
    it('should fetch questions from API with correct parameters', async () => {
      const mockResponse = {
        questions: [{ id: '1', title: 'Test Question' }],
        total: 1,
      }

      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchListingQuestions('speaking', 'read_aloud', {})

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/speaking/questions'),
        expect.objectContaining({
          method: 'GET',
          cache: 'no-store',
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle difficulty filter', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: 'hard',
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('reading', 'multiple_choice', { difficulty: 'hard' })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('difficulty=hard')
    })

    it('should handle search parameter', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: 'test query',
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('writing', 'essay', { search: 'test query' })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('search=test+query')
    })

    it('should handle isActive filter', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: true,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('listening', 'summarize', { isActive: 'true' })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('isActive=true')
    })

    it('should use NEXT_PUBLIC_APP_URL when available', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('speaking', 'read_aloud', {})

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('https://example.com')
    })

    it('should use x-forwarded-proto and x-forwarded-host when available', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('https')
        .mockReturnValueOnce('production.example.com')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('speaking', 'read_aloud', {})

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('https://production.example.com')
    })

    it('should fall back to localhost with custom PORT', async () => {
      process.env.PORT = '4000'

      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn().mockReturnValue(null)
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('speaking', 'read_aloud', {})

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('http://localhost:4000')
    })

    it('should throw error when API returns error', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Database error' }),
      })

      await expect(
        fetchListingQuestions('speaking', 'read_aloud', {})
      ).rejects.toThrow('Database error')
    })

    it('should handle generic API errors', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 1,
        pageSize: 20,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      await expect(
        fetchListingQuestions('speaking', 'read_aloud', {})
      ).rejects.toThrow('Failed to fetch questions from API')
    })

    it('should handle pagination parameters', async () => {
      mockQuestionListingCache.parse.mockReturnValue({
        page: 3,
        pageSize: 50,
        difficulty: undefined,
        search: undefined,
        isActive: undefined,
      })

      const mockHeadersGet = jest.fn()
        .mockReturnValueOnce('http')
        .mockReturnValueOnce('localhost:3000')
      mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await fetchListingQuestions('reading', 'fill_blanks', { page: '3', pageSize: '50' })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('page=3')
      expect(fetchCall).toContain('pageSize=50')
    })

    it('should handle all section types', async () => {
      const sections: Array<'speaking' | 'reading' | 'writing' | 'listening'> = [
        'speaking',
        'reading',
        'writing',
        'listening',
      ]

      for (const section of sections) {
        mockQuestionListingCache.parse.mockReturnValue({
          page: 1,
          pageSize: 20,
          difficulty: undefined,
          search: undefined,
          isActive: undefined,
        })

        const mockHeadersGet = jest.fn()
          .mockReturnValueOnce('http')
          .mockReturnValueOnce('localhost:3000')
        mockHeaders.mockResolvedValue({ get: mockHeadersGet } as any)

        ;(global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({ questions: [] }),
        })

        await fetchListingQuestions(section, 'test_type', {})

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
        expect(fetchCall).toContain(`/api/${section}/questions`)
      }
    })
  })

  describe('getCurrentMonthName', () => {
    it('should return current month name', () => {
      const result = getCurrentMonthName()
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]

      expect(months).toContain(result)
    })

    it('should return a non-empty string', () => {
      const result = getCurrentMonthName()
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return consistent value when called multiple times', () => {
      const result1 = getCurrentMonthName()
      const result2 = getCurrentMonthName()
      expect(result1).toBe(result2)
    })
  })

  describe('getCurrentMonthKey', () => {
    it('should return lowercase month name', () => {
      const result = getCurrentMonthKey()
      expect(result).toBe(result.toLowerCase())
    })

    it('should match lowercase version of getCurrentMonthName', () => {
      const monthName = getCurrentMonthName()
      const monthKey = getCurrentMonthKey()
      expect(monthKey).toBe(monthName.toLowerCase())
    })

    it('should return valid month key', () => {
      const result = getCurrentMonthKey()
      const validKeys = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
      ]

      expect(validKeys).toContain(result)
    })
  })

  describe('categorizeQuestions', () => {
    it('should categorize questions with weekly predictions', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: ['weekly_prediction'] },
        { id: '2', title: 'Q2', tags: ['other'] },
        { id: '3', title: 'Q3', tags: ['weekly_prediction'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toHaveLength(2)
      expect(result.weekly[0].id).toBe('1')
      expect(result.weekly[1].id).toBe('3')
    })

    it('should categorize questions with monthly predictions', () => {
      const currentMonth = getCurrentMonthKey()
      const questions = [
        { id: '1', title: 'Q1', tags: [`prediction_${currentMonth}`] },
        { id: '2', title: 'Q2', tags: ['other'] },
        { id: '3', title: 'Q3', tags: ['monthly_prediction'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.monthly).toHaveLength(2)
    })

    it('should fallback to all questions when no weekly predictions', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: ['other'] },
        { id: '2', title: 'Q2', tags: ['general'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toEqual(questions)
      expect(result.weekly).toHaveLength(2)
    })

    it('should fallback to all questions when no monthly predictions', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: ['other'] },
        { id: '2', title: 'Q2', tags: ['general'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.monthly).toEqual(questions)
      expect(result.monthly).toHaveLength(2)
    })

    it('should always include all questions', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: ['weekly_prediction'] },
        { id: '2', title: 'Q2', tags: ['monthly_prediction'] },
        { id: '3', title: 'Q3', tags: ['other'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.all).toEqual(questions)
      expect(result.all).toHaveLength(3)
    })

    it('should handle empty questions array', () => {
      const result = categorizeQuestions([])

      expect(result.all).toEqual([])
      expect(result.weekly).toEqual([])
      expect(result.monthly).toEqual([])
    })

    it('should handle questions without tags', () => {
      const questions = [
        { id: '1', title: 'Q1' },
        { id: '2', title: 'Q2' },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toEqual(questions)
      expect(result.monthly).toEqual(questions)
    })

    it('should handle questions with null tags', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: null },
        { id: '2', title: 'Q2', tags: null },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toEqual(questions)
      expect(result.monthly).toEqual(questions)
    })

    it('should handle questions with empty tags array', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: [] },
        { id: '2', title: 'Q2', tags: [] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toEqual(questions)
      expect(result.monthly).toEqual(questions)
    })

    it('should handle mixed prediction tags', () => {
      const currentMonth = getCurrentMonthKey()
      const questions = [
        { id: '1', title: 'Q1', tags: ['weekly_prediction', 'monthly_prediction'] },
        { id: '2', title: 'Q2', tags: [`prediction_${currentMonth}`] },
        { id: '3', title: 'Q3', tags: ['other'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toHaveLength(1)
      expect(result.monthly).toHaveLength(2)
    })

    it('should handle questions with multiple tags', () => {
      const questions = [
        { id: '1', title: 'Q1', tags: ['weekly_prediction', 'important', 'featured'] },
        { id: '2', title: 'Q2', tags: ['other', 'extra'] },
      ]

      const result = categorizeQuestions(questions)

      expect(result.weekly).toHaveLength(1)
      expect(result.all).toHaveLength(2)
    })
  })
})
/**
 * Unit tests for lib/subscription/practice-locks.ts
 * Tests practice attempt limits and lock management
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock database
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    execute: jest.fn(),
  },
}))

jest.mock('./tiers', () => ({
  getTierConfig: jest.fn(),
  canPracticeQuestionType: jest.fn(),
  getRemainingPracticeAttempts: jest.fn(),
}))

import { db } from '@/lib/db/drizzle'
import { getTierConfig } from './tiers'
import {
  checkPracticeLock,
  recordPracticeAttempt,
  getUserPracticeLocks,
  resetUserPracticeLocks,
  getPracticeStats,
  withPracticeLock,
  getPracticeLockMessage,
  isSectionLockedForFree,
} from '@/lib/subscription/practice-locks'

describe('lib/subscription/practice-locks', () => {
  const mockDb = db as jest.Mocked<typeof db>
  const mockGetTierConfig = getTierConfig as jest.MockedFunction<typeof getTierConfig>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkPracticeLock', () => {
    it('should return unlimited access for pro tier', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: -1,
          },
        },
      } as any)

      const result = await checkPracticeLock('user-123', 'speaking', 'read_aloud', 'pro')

      expect(result.canPractice).toBe(true)
      expect(result.limit).toBe(-1)
      expect(result.remaining).toBe(-1)
      expect(result.resetsAt).toBeNull()
    })

    it('should check attempts for free tier', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute.mockResolvedValue([
        {
          attempts_today: '2',
          last_attempt_date: new Date().toISOString().split('T')[0],
        },
      ] as any)

      const result = await checkPracticeLock('user-123', 'speaking', 'read_aloud', 'free')

      expect(result.canPractice).toBe(true)
      expect(result.attemptsToday).toBe(2)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(3)
    })

    it('should deny when limit reached', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute.mockResolvedValue([
        {
          attempts_today: '5',
          last_attempt_date: new Date().toISOString().split('T')[0],
        },
      ] as any)

      const result = await checkPracticeLock('user-123', 'speaking', 'read_aloud', 'free')

      expect(result.canPractice).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.reason).toContain('Daily limit reached')
    })

    it('should reset attempts from previous day', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute.mockResolvedValue([
        {
          attempts_today: '5',
          last_attempt_date: yesterday.toISOString().split('T')[0],
        },
      ] as any)

      const result = await checkPracticeLock('user-123', 'speaking', 'read_aloud', 'free')

      expect(result.canPractice).toBe(true)
      expect(result.attemptsToday).toBe(0)
    })

    it('should handle no previous attempts', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute.mockResolvedValue([])

      const result = await checkPracticeLock('user-123', 'speaking', 'read_aloud', 'free')

      expect(result.canPractice).toBe(true)
      expect(result.attemptsToday).toBe(0)
      expect(result.remaining).toBe(5)
    })

    it('should handle undefined limit as unlimited', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {},
        },
      } as any)

      const result = await checkPracticeLock('user-123', 'speaking', 'unknown_type', 'free')

      expect(result.canPractice).toBe(true)
      expect(result.limit).toBe(-1)
    })
  })

  describe('recordPracticeAttempt', () => {
    it('should record new practice attempt', async () => {
      mockDb.execute.mockResolvedValue([])

      await recordPracticeAttempt('user-123', 'speaking', 'read_aloud')

      expect(mockDb.execute).toHaveBeenCalled()
    })

    it('should use current date', async () => {
      const today = new Date().toISOString().split('T')[0]
      mockDb.execute.mockResolvedValue([])

      await recordPracticeAttempt('user-123', 'speaking', 'read_aloud')

      const call = mockDb.execute.mock.calls[0][0]
      expect(call.sql).toContain(today)
    })
  })

  describe('getUserPracticeLocks', () => {
    it('should return locks for all question types', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
            repeat_sentence: 5,
          },
          reading: {
            multiple_choice: -1,
          },
        },
      } as any)

      mockDb.execute.mockResolvedValue([])

      const locks = await getUserPracticeLocks('user-123', 'free')

      expect(locks).toHaveProperty('speaking')
      expect(locks).toHaveProperty('reading')
      expect(locks.speaking).toHaveProperty('read_aloud')
      expect(locks.speaking).toHaveProperty('repeat_sentence')
    })
  })

  describe('resetUserPracticeLocks', () => {
    it('should delete all practice locks for user', async () => {
      mockDb.execute.mockResolvedValue([])

      await resetUserPracticeLocks('user-123')

      expect(mockDb.execute).toHaveBeenCalled()
    })
  })

  describe('getPracticeStats', () => {
    it('should return practice statistics', async () => {
      mockDb.execute.mockResolvedValue([
        {
          section: 'speaking',
          question_type: 'read_aloud',
          total_attempts: 15,
        },
      ] as any)

      const stats = await getPracticeStats('user-123', 7)

      expect(stats).toHaveLength(1)
      expect(mockDb.execute).toHaveBeenCalled()
    })

    it('should use default 7 days', async () => {
      mockDb.execute.mockResolvedValue([])

      await getPracticeStats('user-123')

      expect(mockDb.execute).toHaveBeenCalled()
    })
  })

  describe('withPracticeLock', () => {
    it('should execute callback if practice allowed', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute
        .mockResolvedValueOnce([
          {
            attempts_today: '2',
            last_attempt_date: new Date().toISOString().split('T')[0],
          },
        ] as any)
        .mockResolvedValueOnce([])

      const callback = jest.fn().mockResolvedValue('success')

      const result = await withPracticeLock(
        'user-123',
        'speaking',
        'read_aloud',
        'free',
        callback
      )

      expect(callback).toHaveBeenCalled()
      expect(result).toBe('success')
    })

    it('should throw error if practice locked', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute.mockResolvedValue([
        {
          attempts_today: '5',
          last_attempt_date: new Date().toISOString().split('T')[0],
        },
      ] as any)

      const callback = jest.fn()

      await expect(
        withPracticeLock('user-123', 'speaking', 'read_aloud', 'free', callback)
      ).rejects.toThrow('Practice limit reached')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should record attempt before callback', async () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      mockDb.execute
        .mockResolvedValueOnce([
          {
            attempts_today: '2',
            last_attempt_date: new Date().toISOString().split('T')[0],
          },
        ] as any)
        .mockResolvedValueOnce([])

      const callback = jest.fn().mockResolvedValue('success')

      await withPracticeLock('user-123', 'speaking', 'read_aloud', 'free', callback)

      expect(mockDb.execute).toHaveBeenCalledTimes(2)
    })
  })

  describe('getPracticeLockMessage', () => {
    it('should return unlimited message', () => {
      const status = {
        canPractice: true,
        attemptsToday: 0,
        limit: -1,
        remaining: -1,
        resetsAt: null,
      }

      const message = getPracticeLockMessage(status)

      expect(message).toContain('Unlimited')
    })

    it('should return locked message', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)

      const status = {
        canPractice: false,
        attemptsToday: 5,
        limit: 5,
        remaining: 0,
        resetsAt: tomorrow,
      }

      const message = getPracticeLockMessage(status)

      expect(message).toContain('Daily limit reached')
      expect(message).toContain('5/5')
    })

    it('should return remaining attempts message', () => {
      const status = {
        canPractice: true,
        attemptsToday: 2,
        limit: 5,
        remaining: 3,
        resetsAt: new Date(),
      }

      const message = getPracticeLockMessage(status)

      expect(message).toContain('3 of 5')
    })
  })

  describe('isSectionLockedForFree', () => {
    it('should return false for unlimited sections', () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          reading: {
            multiple_choice: -1,
          },
        },
      } as any)

      const result = isSectionLockedForFree('reading', 'multiple_choice', 10)

      expect(result).toBe(false)
    })

    it('should return true when attempts exceed limit', () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      const result = isSectionLockedForFree('speaking', 'read_aloud', 5)

      expect(result).toBe(true)
    })

    it('should return false when under limit', () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {
            read_aloud: 5,
          },
        },
      } as any)

      const result = isSectionLockedForFree('speaking', 'read_aloud', 3)

      expect(result).toBe(false)
    })

    it('should handle undefined limits', () => {
      mockGetTierConfig.mockReturnValue({
        practiceLimits: {
          speaking: {},
        },
      } as any)

      const result = isSectionLockedForFree('speaking', 'unknown', 10)

      expect(result).toBe(false)
    })
  })
})
/**
 * Unit tests for lib/subscription/credits.ts
 * Tests AI credit management and tracking system
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock database
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
    execute: jest.fn(),
  },
}))

jest.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
}))

jest.mock('./tiers', () => ({
  getTierConfig: jest.fn(),
  getRemainingAiCredits: jest.fn(),
  hasAiCreditsAvailable: jest.fn(),
}))

import { db } from '@/lib/db/drizzle'
import {
  checkAndResetCredits,
  getCreditStatus,
  deductAiCredit,
  getCreditsNeeded,
  canUseAiScoring,
  getCreditUsageStats,
  withCreditCheck,
  getCreditStatusMessage,
} from '@/lib/subscription/credits'

describe('lib/subscription/credits', () => {
  const mockDb = db as jest.Mocked<typeof db>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkAndResetCredits', () => {
    it('should throw error if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null)

      await expect(checkAndResetCredits('user-123')).rejects.toThrow('User not found')
    })

    it('should not reset credits if same day', async () => {
      const today = new Date()
      mockDb.query.users.findFirst.mockResolvedValue({
        id: 'user-123',
        aiCreditsUsed: 5,
        lastCreditReset: today,
        dailyAiCredits: 10,
      })

      await checkAndResetCredits('user-123')

      expect(mockDb.update).not.toHaveBeenCalled()
    })

    it('should reset credits if new day', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      mockDb.query.users.findFirst.mockResolvedValue({
        id: 'user-123',
        aiCreditsUsed: 5,
        lastCreditReset: yesterday,
        dailyAiCredits: 10,
      })

      const mockSet = jest.fn(() => ({ where: jest.fn() }))
      mockDb.update.mockReturnValue({ set: mockSet } as any)

      await checkAndResetCredits('user-123')

      expect(mockDb.update).toHaveBeenCalled()
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          aiCreditsUsed: 0,
          lastCreditReset: expect.any(Date),
        })
      )
    })

    it('should handle user with no lastCreditReset', async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        id: 'user-123',
        aiCreditsUsed: 5,
        lastCreditReset: null,
        dailyAiCredits: 10,
      })

      const mockSet = jest.fn(() => ({ where: jest.fn() }))
      mockDb.update.mockReturnValue({ set: mockSet } as any)

      await checkAndResetCredits('user-123')

      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('getCreditStatus', () => {
    it('should return credit status for user', async () => {
      const today = new Date()
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 3,
          lastCreditReset: today,
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 3,
          lastCreditReset: today,
          dailyAiCredits: 10,
        })

      const status = await getCreditStatus('user-123')

      expect(status.total).toBe(10)
      expect(status.used).toBe(3)
      expect(status.remaining).toBe(7)
      expect(status.resetsAt).toBeInstanceOf(Date)
    })

    it('should handle unlimited credits', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-pro',
          aiCreditsUsed: 100,
          lastCreditReset: new Date(),
          dailyAiCredits: -1,
        })
        .mockResolvedValueOnce({
          id: 'user-pro',
          aiCreditsUsed: 100,
          lastCreditReset: new Date(),
          dailyAiCredits: -1,
        })

      const status = await getCreditStatus('user-pro')

      expect(status.total).toBe(-1)
      expect(status.remaining).toBe(-1)
      expect(status.resetsAt).toBeNull()
    })

    it('should use default credits if not set', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-new',
          aiCreditsUsed: null,
          lastCreditReset: new Date(),
          dailyAiCredits: null,
        })
        .mockResolvedValueOnce({
          id: 'user-new',
          aiCreditsUsed: null,
          lastCreditReset: new Date(),
          dailyAiCredits: null,
        })

      const status = await getCreditStatus('user-new')

      expect(status.total).toBe(4)
      expect(status.used).toBe(0)
    })

    it('should not return negative remaining', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-over',
          aiCreditsUsed: 15,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-over',
          aiCreditsUsed: 15,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const status = await getCreditStatus('user-over')

      expect(status.remaining).toBe(0)
    })
  })

  describe('deductAiCredit', () => {
    it('should deduct credit successfully', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const mockSet = jest.fn(() => ({ where: jest.fn() }))
      mockDb.update.mockReturnValue({ set: mockSet } as any)

      const result = await deductAiCredit('user-123', 1)

      expect(result).toBe(true)
      expect(mockSet).toHaveBeenCalledWith({ aiCreditsUsed: 6 })
    })

    it('should return false if insufficient credits', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 10,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 10,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const result = await deductAiCredit('user-123', 1)

      expect(result).toBe(false)
      expect(mockDb.update).not.toHaveBeenCalled()
    })

    it('should deduct multiple credits', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 20,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 20,
        })

      const mockSet = jest.fn(() => ({ where: jest.fn() }))
      mockDb.update.mockReturnValue({ set: mockSet } as any)

      const result = await deductAiCredit('user-123', 3)

      expect(result).toBe(true)
      expect(mockSet).toHaveBeenCalledWith({ aiCreditsUsed: 8 })
    })

    it('should allow unlimited credits', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-pro',
          aiCreditsUsed: 1000,
          lastCreditReset: new Date(),
          dailyAiCredits: -1,
        })
        .mockResolvedValueOnce({
          id: 'user-pro',
          aiCreditsUsed: 1000,
          lastCreditReset: new Date(),
          dailyAiCredits: -1,
        })

      const mockSet = jest.fn(() => ({ where: jest.fn() }))
      mockDb.update.mockReturnValue({ set: mockSet } as any)

      const result = await deductAiCredit('user-pro', 1)

      expect(result).toBe(true)
    })
  })

  describe('getCreditsNeeded', () => {
    it('should return 0 for auto-scored reading questions', () => {
      expect(getCreditsNeeded('multiple_choice_single')).toBe(0)
      expect(getCreditsNeeded('multiple_choice_multiple')).toBe(0)
      expect(getCreditsNeeded('reorder_paragraphs')).toBe(0)
      expect(getCreditsNeeded('fill_in_blanks')).toBe(0)
    })

    it('should return 0 for auto-scored listening MCQs', () => {
      expect(getCreditsNeeded('highlight_correct_summary')).toBe(0)
      expect(getCreditsNeeded('select_missing_word')).toBe(0)
    })

    it('should return 1 for AI-scored questions', () => {
      expect(getCreditsNeeded('read_aloud')).toBe(1)
      expect(getCreditsNeeded('essay')).toBe(1)
      expect(getCreditsNeeded('summarize_written_text')).toBe(1)
    })

    it('should return 1 for unknown question types', () => {
      expect(getCreditsNeeded('unknown_type')).toBe(1)
    })
  })

  describe('canUseAiScoring', () => {
    it('should allow auto-scored questions without checking credits', async () => {
      const result = await canUseAiScoring('user-123', 'multiple_choice_single')

      expect(result.allowed).toBe(true)
      expect(mockDb.query.users.findFirst).not.toHaveBeenCalled()
    })

    it('should check credits for AI-scored questions', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const result = await canUseAiScoring('user-123', 'read_aloud')

      expect(result.allowed).toBe(true)
    })

    it('should deny when insufficient credits', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 10,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 10,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const result = await canUseAiScoring('user-123', 'essay')

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Not enough AI credits')
    })

    it('should allow unlimited credits', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-pro',
          aiCreditsUsed: 1000,
          lastCreditReset: new Date(),
          dailyAiCredits: -1,
        })
        .mockResolvedValueOnce({
          id: 'user-pro',
          aiCreditsUsed: 1000,
          lastCreditReset: new Date(),
          dailyAiCredits: -1,
        })

      const result = await canUseAiScoring('user-pro', 'essay')

      expect(result.allowed).toBe(true)
    })
  })

  describe('getCreditUsageStats', () => {
    it('should return placeholder stats', async () => {
      const stats = await getCreditUsageStats('user-123', 7)

      expect(stats).toHaveProperty('totalUsed')
      expect(stats).toHaveProperty('averagePerDay')
      expect(stats).toHaveProperty('peakDay')
      expect(stats).toHaveProperty('history')
    })
  })

  describe('withCreditCheck', () => {
    it('should execute callback if credits available', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 5,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const mockSet = jest.fn(() => ({ where: jest.fn() }))
      mockDb.update.mockReturnValue({ set: mockSet } as any)

      const callback = jest.fn().mockResolvedValue('success')

      const result = await withCreditCheck('user-123', 'essay', callback)

      expect(callback).toHaveBeenCalled()
      expect(result).toBe('success')
    })

    it('should throw error if credits not available', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 10,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })
        .mockResolvedValueOnce({
          id: 'user-123',
          aiCreditsUsed: 10,
          lastCreditReset: new Date(),
          dailyAiCredits: 10,
        })

      const callback = jest.fn()

      await expect(
        withCreditCheck('user-123', 'essay', callback)
      ).rejects.toThrow('Insufficient AI credits')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not deduct for auto-scored questions', async () => {
      const callback = jest.fn().mockResolvedValue('success')

      const result = await withCreditCheck('user-123', 'multiple_choice_single', callback)

      expect(callback).toHaveBeenCalled()
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('getCreditStatusMessage', () => {
    it('should return unlimited message', () => {
      const status = {
        total: -1,
        used: 100,
        remaining: -1,
        resetsAt: null,
      }

      const message = getCreditStatusMessage(status)

      expect(message).toContain('Unlimited')
    })

    it('should return no credits message', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)

      const status = {
        total: 10,
        used: 10,
        remaining: 0,
        resetsAt: tomorrow,
      }

      const message = getCreditStatusMessage(status)

      expect(message).toContain('No AI credits remaining')
    })

    it('should return remaining credits message', () => {
      const status = {
        total: 10,
        used: 3,
        remaining: 7,
        resetsAt: new Date(),
      }

      const message = getCreditStatusMessage(status)

      expect(message).toContain('7 of 10')
    })
  })
})
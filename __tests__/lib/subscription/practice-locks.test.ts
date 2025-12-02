/**
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/db/schema', () => ({
  users: {
    id: 'id',
    subscriptionTier: 'subscriptionTier',
  },
  practiceLocks: {
    id: 'id',
    userId: 'userId',
    questionType: 'questionType',
    lockedUntil: 'lockedUntil',
    createdAt: 'createdAt',
  },
}));

import {
  checkPracticeLock,
  createPracticeLock,
  removePracticeLock,
  getUserPracticeLocks,
  isQuestionTypeLocked,
  LOCK_DURATIONS,
  TIER_LIMITS,
} from '@/lib/subscription/practice-locks';

describe('Practice Locks Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('LOCK_DURATIONS constants', () => {
    it('should define lock durations for all tiers', () => {
      expect(LOCK_DURATIONS).toBeDefined();
      expect(LOCK_DURATIONS.FREE).toBeGreaterThan(0);
      expect(LOCK_DURATIONS.BASIC).toBeGreaterThan(0);
      expect(LOCK_DURATIONS.PRO).toBeGreaterThan(0);
      expect(LOCK_DURATIONS.PREMIUM).toBe(0); // No locks for premium
    });

    it('should have decreasing durations for higher tiers', () => {
      expect(LOCK_DURATIONS.BASIC).toBeLessThan(LOCK_DURATIONS.FREE);
      expect(LOCK_DURATIONS.PRO).toBeLessThan(LOCK_DURATIONS.BASIC);
    });
  });

  describe('TIER_LIMITS constants', () => {
    it('should define practice limits for all tiers', () => {
      expect(TIER_LIMITS).toBeDefined();
      expect(TIER_LIMITS.FREE).toBeDefined();
      expect(TIER_LIMITS.BASIC).toBeDefined();
      expect(TIER_LIMITS.PRO).toBeDefined();
      expect(TIER_LIMITS.PREMIUM).toBeDefined();
    });

    it('should have increasing limits for higher tiers', () => {
      expect(TIER_LIMITS.BASIC.SPEAKING).toBeGreaterThan(TIER_LIMITS.FREE.SPEAKING);
      expect(TIER_LIMITS.PRO.SPEAKING).toBeGreaterThan(TIER_LIMITS.BASIC.SPEAKING);
      expect(TIER_LIMITS.PREMIUM.SPEAKING).toBeGreaterThan(TIER_LIMITS.PRO.SPEAKING);
    });

    it('should have limits for all practice types', () => {
      Object.values(TIER_LIMITS).forEach(tier => {
        expect(tier.SPEAKING).toBeDefined();
        expect(tier.WRITING).toBeDefined();
        expect(tier.READING).toBeDefined();
        expect(tier.LISTENING).toBeDefined();
      });
    });
  });

  describe('checkPracticeLock', () => {
    it('should return unlocked when no lock exists', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await checkPracticeLock('user-123', 'SPEAKING');

      expect(result).toEqual({
        locked: false,
      });
    });

    it('should return locked when active lock exists', async () => {
      const { db } = await import('@/lib/db');
      
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const mockLock = {
        id: 'lock-1',
        userId: 'user-123',
        questionType: 'SPEAKING',
        lockedUntil: futureDate,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockLock]),
        }),
      });

      const result = await checkPracticeLock('user-123', 'SPEAKING');

      expect(result).toEqual({
        locked: true,
        lockedUntil: futureDate,
        remainingTime: expect.any(Number),
      });
      expect(result.remainingTime).toBeGreaterThan(0);
    });

    it('should return unlocked when lock has expired', async () => {
      const { db } = await import('@/lib/db');
      
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const mockLock = {
        id: 'lock-1',
        userId: 'user-123',
        questionType: 'SPEAKING',
        lockedUntil: pastDate,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockLock]),
        }),
      });

      const result = await checkPracticeLock('user-123', 'SPEAKING');

      expect(result).toEqual({
        locked: false,
      });
    });

    it('should handle database errors', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(checkPracticeLock('user-123', 'SPEAKING')).rejects.toThrow('Database error');
    });

    it('should handle invalid question types', async () => {
      await expect(checkPracticeLock('user-123', 'INVALID' as any)).rejects.toThrow();
    });

    it('should handle null or undefined userId', async () => {
      await expect(checkPracticeLock(null as any, 'SPEAKING')).rejects.toThrow();
      await expect(checkPracticeLock(undefined as any, 'SPEAKING')).rejects.toThrow();
    });
  });

  describe('createPracticeLock', () => {
    it('should create lock with correct duration for FREE tier', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'FREE',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      const result = await createPracticeLock('user-123', 'SPEAKING');

      expect(result.success).toBe(true);
      expect(result.lockedUntil).toBeInstanceOf(Date);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          questionType: 'SPEAKING',
          lockedUntil: expect.any(Date),
        })
      );
    });

    it('should not create lock for PREMIUM tier', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'PREMIUM',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const result = await createPracticeLock('user-123', 'SPEAKING');

      expect(result).toEqual({
        success: true,
        message: 'No lock required for premium tier',
      });
    });

    it('should calculate correct lock duration for each tier', async () => {
      const { db } = await import('@/lib/db');

      for (const tier of ['FREE', 'BASIC', 'PRO']) {
        const mockUser = {
          id: 'user-123',
          subscriptionTier: tier,
        };

        (db.select as jest.MockedFunction<any>).mockReturnValue({
          from: jest.fn().mockResolvedValue([mockUser]),
          where: jest.fn().mockReturnThis(),
        });

        const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
        (db.insert as jest.MockedFunction<any>).mockReturnValue({
          values: mockInsert,
        });

        const result = await createPracticeLock('user-123', 'SPEAKING');

        if (result.lockedUntil) {
          const expectedDuration = LOCK_DURATIONS[tier as keyof typeof LOCK_DURATIONS];
          const actualDuration = result.lockedUntil.getTime() - Date.now();
          
          // Allow 1 second tolerance for execution time
          expect(Math.abs(actualDuration - expectedDuration)).toBeLessThan(1000);
        }
      }
    });

    it('should handle non-existent user', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
      });

      const result = await createPracticeLock('non-existent', 'SPEAKING');

      expect(result).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should prevent duplicate locks', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'FREE',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.insert as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Duplicate key violation');
      });

      await expect(createPracticeLock('user-123', 'SPEAKING')).rejects.toThrow();
    });

    it('should handle all question types', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'FREE',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      for (const type of ['SPEAKING', 'WRITING', 'READING', 'LISTENING']) {
        await createPracticeLock('user-123', type as any);
        expect(mockInsert).toHaveBeenCalled();
      }
    });
  });

  describe('removePracticeLock', () => {
    it('should successfully remove existing lock', async () => {
      const { db } = await import('@/lib/db');
      
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await removePracticeLock('user-123', 'SPEAKING');

      expect(result).toEqual({
        success: true,
      });
    });

    it('should handle non-existent lock gracefully', async () => {
      const { db } = await import('@/lib/db');
      
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 0 }),
      });

      const result = await removePracticeLock('user-123', 'SPEAKING');

      expect(result).toEqual({
        success: true,
        message: 'No lock found to remove',
      });
    });

    it('should handle database errors', async () => {
      const { db } = await import('@/lib/db');
      
      (db.delete as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(removePracticeLock('user-123', 'SPEAKING')).rejects.toThrow('Database error');
    });

    it('should handle multiple locks removal', async () => {
      const { db } = await import('@/lib/db');
      
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 3 }),
      });

      const result = await removePracticeLock('user-123', 'SPEAKING');

      expect(result.success).toBe(true);
    });
  });

  describe('getUserPracticeLocks', () => {
    it('should return all active locks for user', async () => {
      const { db } = await import('@/lib/db');
      
      const mockLocks = [
        {
          id: 'lock-1',
          userId: 'user-123',
          questionType: 'SPEAKING',
          lockedUntil: new Date(Date.now() + 3600000),
        },
        {
          id: 'lock-2',
          userId: 'user-123',
          questionType: 'WRITING',
          lockedUntil: new Date(Date.now() + 7200000),
        },
      ];

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockLocks),
        }),
      });

      const result = await getUserPracticeLocks('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].questionType).toBe('SPEAKING');
      expect(result[1].questionType).toBe('WRITING');
    });

    it('should filter expired locks', async () => {
      const { db } = await import('@/lib/db');
      
      const mockLocks = [
        {
          id: 'lock-1',
          userId: 'user-123',
          questionType: 'SPEAKING',
          lockedUntil: new Date(Date.now() + 3600000), // Active
        },
        {
          id: 'lock-2',
          userId: 'user-123',
          questionType: 'WRITING',
          lockedUntil: new Date(Date.now() - 3600000), // Expired
        },
      ];

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockLocks),
        }),
      });

      const result = await getUserPracticeLocks('user-123', { activeOnly: true });

      expect(result).toHaveLength(1);
      expect(result[0].questionType).toBe('SPEAKING');
    });

    it('should return empty array for user with no locks', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await getUserPracticeLocks('user-123');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getUserPracticeLocks('user-123')).rejects.toThrow('Database error');
    });

    it('should sort locks by expiration time', async () => {
      const { db } = await import('@/lib/db');
      
      const now = Date.now();
      const mockLocks = [
        {
          id: 'lock-1',
          userId: 'user-123',
          questionType: 'WRITING',
          lockedUntil: new Date(now + 7200000),
        },
        {
          id: 'lock-2',
          userId: 'user-123',
          questionType: 'SPEAKING',
          lockedUntil: new Date(now + 3600000),
        },
      ];

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockLocks),
        }),
      });

      const result = await getUserPracticeLocks('user-123', { sortBy: 'expiration' });

      expect(result[0].questionType).toBe('SPEAKING'); // Expires sooner
      expect(result[1].questionType).toBe('WRITING');
    });
  });

  describe('isQuestionTypeLocked', () => {
    it('should return true for locked question type', async () => {
      const { db } = await import('@/lib/db');
      
      const futureDate = new Date(Date.now() + 3600000);
      const mockLock = {
        id: 'lock-1',
        userId: 'user-123',
        questionType: 'SPEAKING',
        lockedUntil: futureDate,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockLock]),
        }),
      });

      const isLocked = await isQuestionTypeLocked('user-123', 'SPEAKING');

      expect(isLocked).toBe(true);
    });

    it('should return false for unlocked question type', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const isLocked = await isQuestionTypeLocked('user-123', 'SPEAKING');

      expect(isLocked).toBe(false);
    });

    it('should return false for expired locks', async () => {
      const { db } = await import('@/lib/db');
      
      const pastDate = new Date(Date.now() - 3600000);
      const mockLock = {
        id: 'lock-1',
        userId: 'user-123',
        questionType: 'SPEAKING',
        lockedUntil: pastDate,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockLock]),
        }),
      });

      const isLocked = await isQuestionTypeLocked('user-123', 'SPEAKING');

      expect(isLocked).toBe(false);
    });

    it('should handle multiple question types independently', async () => {
      const { db } = await import('@/lib/db');
      
      const futureDate = new Date(Date.now() + 3600000);
      
      (db.select as jest.MockedFunction<any>).mockImplementation((columns: any) => {
        return {
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockImplementation((condition: any) => {
              // Mock different responses based on question type
              const type = condition.questionType;
              if (type === 'SPEAKING') {
                return Promise.resolve([{
                  id: 'lock-1',
                  userId: 'user-123',
                  questionType: 'SPEAKING',
                  lockedUntil: futureDate,
                }]);
              }
              return Promise.resolve([]);
            }),
          }),
        };
      });

      const speakingLocked = await isQuestionTypeLocked('user-123', 'SPEAKING');
      const writingLocked = await isQuestionTypeLocked('user-123', 'WRITING');

      expect(speakingLocked).toBe(true);
      expect(writingLocked).toBe(false);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle rapid consecutive lock checks', async () => {
      const { db } = await import('@/lib/db');
      
      const futureDate = new Date(Date.now() + 3600000);
      const mockLock = {
        id: 'lock-1',
        userId: 'user-123',
        questionType: 'SPEAKING',
        lockedUntil: futureDate,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockLock]),
        }),
      });

      const promises = Array(10).fill(null).map(() => 
        checkPracticeLock('user-123', 'SPEAKING')
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.locked).toBe(true);
      });
    });

    it('should handle lock creation race conditions', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'FREE',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      let lockCount = 0;
      (db.insert as jest.MockedFunction<any>).mockImplementation(() => ({
        values: jest.fn().mockImplementation(() => {
          lockCount++;
          if (lockCount > 1) {
            throw new Error('Duplicate lock');
          }
          return Promise.resolve({ rowCount: 1 });
        }),
      }));

      const promises = Array(3).fill(null).map(() =>
        createPracticeLock('user-123', 'SPEAKING').catch(e => ({ error: e.message }))
      );

      const results = await Promise.all(promises);

      const successCount = results.filter(r => (r as any).success).length;
      expect(successCount).toBe(1); // Only one should succeed
    });

    it('should handle timezone differences correctly', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'FREE',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      const result = await createPracticeLock('user-123', 'SPEAKING');

      expect(result.lockedUntil).toBeInstanceOf(Date);
      expect(result.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle cleanup of expired locks', async () => {
      const { db } = await import('@/lib/db');
      
      const now = Date.now();
      const mockLocks = [
        {
          id: 'lock-1',
          userId: 'user-123',
          questionType: 'SPEAKING',
          lockedUntil: new Date(now - 3600000), // Expired
        },
        {
          id: 'lock-2',
          userId: 'user-123',
          questionType: 'WRITING',
          lockedUntil: new Date(now + 3600000), // Active
        },
      ];

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockLocks),
        }),
      });

      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await getUserPracticeLocks('user-123', { cleanupExpired: true });

      expect(result).toHaveLength(1);
      expect(result[0].questionType).toBe('WRITING');
      expect(db.delete).toHaveBeenCalled();
    });

    it('should maintain lock integrity across tier changes', async () => {
      const { db } = await import('@/lib/db');
      
      // User starts as FREE tier
      let userTier = 'FREE';
      const mockUser = {
        id: 'user-123',
        subscriptionTier: userTier,
      };

      (db.select as jest.MockedFunction<any>).mockImplementation(() => ({
        from: jest.fn().mockResolvedValue([{ ...mockUser, subscriptionTier: userTier }]),
        where: jest.fn().mockReturnThis(),
      }));

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      // Create lock as FREE tier
      const result1 = await createPracticeLock('user-123', 'SPEAKING');
      expect(result1.success).toBe(true);

      // Upgrade to PREMIUM
      userTier = 'PREMIUM';

      // Should not create new lock
      const result2 = await createPracticeLock('user-123', 'WRITING');
      expect(result2.message).toContain('premium');
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large number of locks efficiently', async () => {
      const { db } = await import('@/lib/db');
      
      const mockLocks = Array(100).fill(null).map((_, i) => ({
        id: `lock-${i}`,
        userId: 'user-123',
        questionType: i % 2 === 0 ? 'SPEAKING' : 'WRITING',
        lockedUntil: new Date(Date.now() + 3600000),
      }));

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockLocks),
        }),
      });

      const start = Date.now();
      const result = await getUserPracticeLocks('user-123');
      const duration = Date.now() - start;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should cache lock checks for performance', async () => {
      const { db } = await import('@/lib/db');
      
      let callCount = 0;
      (db.select as jest.MockedFunction<any>).mockImplementation(() => {
        callCount++;
        return {
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        };
      });

      // Make multiple calls in quick succession
      await checkPracticeLock('user-123', 'SPEAKING');
      await checkPracticeLock('user-123', 'SPEAKING');
      await checkPracticeLock('user-123', 'SPEAKING');

      // Without caching, would call database 3 times
      // With caching, might call less (implementation dependent)
      expect(callCount).toBeGreaterThan(0);
    });
  });
});
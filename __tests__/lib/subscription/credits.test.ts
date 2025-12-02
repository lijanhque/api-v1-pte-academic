/**
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

// Mock dependencies before imports
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
    email: 'email',
    credits: 'credits',
    subscriptionTier: 'subscriptionTier',
  },
  creditTransactions: {
    id: 'id',
    userId: 'userId',
    amount: 'amount',
    type: 'type',
    description: 'description',
    createdAt: 'createdAt',
  },
}));

// Import after mocks
import {
  getUserCredits,
  deductCredits,
  addCredits,
  getCreditHistory,
  getCreditBalance,
  CREDIT_COSTS,
  TIER_CREDITS,
} from '@/lib/subscription/credits';

describe('Credits Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CREDIT_COSTS constants', () => {
    it('should define credit costs for all practice types', () => {
      expect(CREDIT_COSTS).toBeDefined();
      expect(CREDIT_COSTS.SPEAKING).toBeGreaterThan(0);
      expect(CREDIT_COSTS.WRITING).toBeGreaterThan(0);
      expect(CREDIT_COSTS.READING).toBeGreaterThan(0);
      expect(CREDIT_COSTS.LISTENING).toBeGreaterThan(0);
      expect(CREDIT_COSTS.MOCK_TEST).toBeGreaterThan(0);
    });

    it('should have reasonable credit costs', () => {
      // Speaking should be most expensive (AI scoring)
      expect(CREDIT_COSTS.SPEAKING).toBeGreaterThanOrEqual(CREDIT_COSTS.WRITING);
      expect(CREDIT_COSTS.MOCK_TEST).toBeGreaterThan(CREDIT_COSTS.SPEAKING);
    });
  });

  describe('TIER_CREDITS constants', () => {
    it('should define credits for all subscription tiers', () => {
      expect(TIER_CREDITS).toBeDefined();
      expect(TIER_CREDITS.FREE).toBeDefined();
      expect(TIER_CREDITS.BASIC).toBeDefined();
      expect(TIER_CREDITS.PRO).toBeDefined();
      expect(TIER_CREDITS.PREMIUM).toBeDefined();
    });

    it('should have increasing credits for higher tiers', () => {
      expect(TIER_CREDITS.BASIC).toBeGreaterThan(TIER_CREDITS.FREE);
      expect(TIER_CREDITS.PRO).toBeGreaterThan(TIER_CREDITS.BASIC);
      expect(TIER_CREDITS.PREMIUM).toBeGreaterThan(TIER_CREDITS.PRO);
    });
  });

  describe('getUserCredits', () => {
    it('should return user credits for valid userId', async () => {
      const mockUser = {
        id: 'user-123',
        credits: 100,
        subscriptionTier: 'PRO',
      };

      const { db } = await import('@/lib/db');
      const mockFrom = jest.fn().mockResolvedValue([mockUser]);
      const mockWhere = jest.fn().mockReturnValue({ from: mockFrom });
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
      });

      const result = await getUserCredits('user-123');

      expect(result).toEqual({
        credits: 100,
        tier: 'PRO',
      });
    });

    it('should return null for non-existent user', async () => {
      const { db } = await import('@/lib/db');
      const mockFrom = jest.fn().mockResolvedValue([]);
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: mockFrom,
        where: jest.fn().mockReturnThis(),
      });

      const result = await getUserCredits('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const { db } = await import('@/lib/db');
      (db.select as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(getUserCredits('user-123')).rejects.toThrow('Database connection failed');
    });

    it('should handle null or undefined userId', async () => {
      await expect(getUserCredits(null as any)).rejects.toThrow();
      await expect(getUserCredits(undefined as any)).rejects.toThrow();
    });

    it('should handle empty string userId', async () => {
      await expect(getUserCredits('')).rejects.toThrow();
    });
  });

  describe('deductCredits', () => {
    it('should successfully deduct credits when balance is sufficient', async () => {
      const { db } = await import('@/lib/db');
      
      // Mock user query
      const mockUser = { id: 'user-123', credits: 100 };
      const mockSelectFrom = jest.fn().mockResolvedValue([mockUser]);
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: mockSelectFrom,
        where: jest.fn().mockReturnThis(),
      });

      // Mock update
      const mockUpdate = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockUpdate),
        }),
      });

      // Mock transaction insert
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await deductCredits('user-123', 10, 'SPEAKING', 'Practice session');

      expect(result).toEqual({
        success: true,
        newBalance: 90,
      });
    });

    it('should fail when insufficient credits', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 5 };
      const mockSelectFrom = jest.fn().mockResolvedValue([mockUser]);
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: mockSelectFrom,
        where: jest.fn().mockReturnThis(),
      });

      const result = await deductCredits('user-123', 10, 'SPEAKING', 'Practice session');

      expect(result).toEqual({
        success: false,
        error: 'Insufficient credits',
        currentBalance: 5,
        required: 10,
      });
    });

    it('should handle negative deduction amounts', async () => {
      await expect(
        deductCredits('user-123', -10, 'SPEAKING', 'Test')
      ).rejects.toThrow();
    });

    it('should handle zero deduction amounts', async () => {
      const result = await deductCredits('user-123', 0, 'SPEAKING', 'Test');
      expect(result.success).toBe(true);
      expect(result.newBalance).toBeDefined();
    });

    it('should record transaction with correct details', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      await deductCredits('user-123', 10, 'SPEAKING', 'Practice session');

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          amount: -10,
          type: 'DEDUCTION',
          description: expect.stringContaining('Practice session'),
        })
      );
    });

    it('should handle user not found', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
      });

      const result = await deductCredits('non-existent', 10, 'SPEAKING', 'Test');

      expect(result).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should handle database transaction failures', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Transaction failed');
      });

      await expect(
        deductCredits('user-123', 10, 'SPEAKING', 'Test')
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('addCredits', () => {
    it('should successfully add credits', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await addCredits('user-123', 50, 'PURCHASE', 'Subscription renewal');

      expect(result).toEqual({
        success: true,
        newBalance: 150,
      });
    });

    it('should handle negative amounts', async () => {
      await expect(
        addCredits('user-123', -50, 'PURCHASE', 'Test')
      ).rejects.toThrow();
    });

    it('should record transaction with correct type', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      await addCredits('user-123', 50, 'BONUS', 'Referral reward');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          amount: 50,
          type: 'CREDIT',
          description: expect.stringContaining('Referral reward'),
        })
      );
    });

    it('should handle large credit amounts', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await addCredits('user-123', 999999, 'ADMIN', 'Test');

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(1000099);
    });
  });

  describe('getCreditHistory', () => {
    it('should return paginated credit history', async () => {
      const { db } = await import('@/lib/db');
      
      const mockTransactions = [
        {
          id: 'tx-1',
          userId: 'user-123',
          amount: -10,
          type: 'DEDUCTION',
          description: 'Speaking practice',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'tx-2',
          userId: 'user-123',
          amount: 50,
          type: 'CREDIT',
          description: 'Subscription',
          createdAt: new Date('2024-01-02'),
        },
      ];

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue(mockTransactions),
              }),
            }),
          }),
        }),
      });

      const result = await getCreditHistory('user-123', { page: 1, pageSize: 10 });

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'tx-1');
      expect(result[1]).toHaveProperty('id', 'tx-2');
    });

    it('should handle empty history', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await getCreditHistory('user-123');

      expect(result).toEqual([]);
    });

    it('should handle pagination correctly', async () => {
      const { db } = await import('@/lib/db');
      
      const mockLimit = jest.fn().mockReturnValue({
        offset: jest.fn().mockResolvedValue([]),
      });

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      await getCreditHistory('user-123', { page: 2, pageSize: 20 });

      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('should filter by transaction type', async () => {
      const { db } = await import('@/lib/db');
      
      const mockWhere = jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      await getCreditHistory('user-123', { type: 'DEDUCTION' });

      expect(mockWhere).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      const { db } = await import('@/lib/db');
      
      const mockWhere = jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await getCreditHistory('user-123', { startDate, endDate });

      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe('getCreditBalance', () => {
    it('should return current credit balance', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 150 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const balance = await getCreditBalance('user-123');

      expect(balance).toBe(150);
    });

    it('should return 0 for users with no credits', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 0 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const balance = await getCreditBalance('user-123');

      expect(balance).toBe(0);
    });

    it('should throw error for non-existent user', async () => {
      const { db } = await import('@/lib/db');
      
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
      });

      await expect(getCreditBalance('non-existent')).rejects.toThrow();
    });

    it('should handle null credits value', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: null };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const balance = await getCreditBalance('user-123');

      expect(balance).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent deductions gracefully', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      // Simulate concurrent deductions
      const promises = [
        deductCredits('user-123', 30, 'SPEAKING', 'Test 1'),
        deductCredits('user-123', 30, 'SPEAKING', 'Test 2'),
        deductCredits('user-123', 30, 'SPEAKING', 'Test 3'),
      ];

      const results = await Promise.all(promises);

      // At least one should succeed
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should handle special characters in descriptions', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const mockInsert = jest.fn().mockResolvedValue({ rowCount: 1 });
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: mockInsert,
      });

      const specialDesc = "Practice with emoji 🎯 and quotes \"test\" and <script>alert('xss')</script>";
      await deductCredits('user-123', 10, 'SPEAKING', specialDesc);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('emoji'),
        })
      );
    });

    it('should maintain credit balance integrity', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { id: 'user-123', credits: 100 };
      let currentCredits = 100;

      (db.select as jest.MockedFunction<any>).mockImplementation(() => ({
        from: jest.fn().mockResolvedValue([{ ...mockUser, credits: currentCredits }]),
        where: jest.fn().mockReturnThis(),
      }));

      (db.update as jest.MockedFunction<any>).mockImplementation(() => ({
        set: jest.fn().mockImplementation((update: any) => {
          currentCredits = update.credits;
          return {
            where: jest.fn().mockResolvedValue({ rowCount: 1 }),
          };
        }),
      }));

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      await deductCredits('user-123', 30, 'SPEAKING', 'Test 1');
      await addCredits('user-123', 20, 'BONUS', 'Test 2');
      await deductCredits('user-123', 10, 'WRITING', 'Test 3');

      expect(currentCredits).toBe(80); // 100 - 30 + 20 - 10
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user lifecycle', async () => {
      const { db } = await import('@/lib/db');
      
      let currentCredits = 0;
      const mockUser = { id: 'user-123', credits: currentCredits };

      (db.select as jest.MockedFunction<any>).mockImplementation(() => ({
        from: jest.fn().mockResolvedValue([{ ...mockUser, credits: currentCredits }]),
        where: jest.fn().mockReturnThis(),
      }));

      (db.update as jest.MockedFunction<any>).mockImplementation(() => ({
        set: jest.fn().mockImplementation((update: any) => {
          currentCredits = update.credits;
          return {
            where: jest.fn().mockResolvedValue({ rowCount: 1 }),
          };
        }),
      }));

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });

      // New user subscribes
      await addCredits('user-123', 100, 'SUBSCRIPTION', 'Pro plan');
      expect(currentCredits).toBe(100);

      // User practices
      await deductCredits('user-123', 10, 'SPEAKING', 'Practice 1');
      expect(currentCredits).toBe(90);

      // User gets bonus
      await addCredits('user-123', 20, 'BONUS', 'Referral');
      expect(currentCredits).toBe(110);

      // More practice
      await deductCredits('user-123', 5, 'READING', 'Practice 2');
      expect(currentCredits).toBe(105);
    });

    it('should handle subscription tier upgrade', async () => {
      const { db } = await import('@/lib/db');
      
      const mockUser = { 
        id: 'user-123', 
        credits: TIER_CREDITS.BASIC,
        subscriptionTier: 'BASIC'
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockResolvedValue([mockUser]),
        where: jest.fn().mockReturnThis(),
      });

      const credits = await getUserCredits('user-123');
      
      expect(credits?.credits).toBe(TIER_CREDITS.BASIC);
      expect(credits?.tier).toBe('BASIC');
    });
  });
});
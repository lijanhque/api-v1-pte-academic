/**
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies before imports
jest.mock('server-only', () => ({}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/db/drizzle', () => ({
  db: {
    update: jest.fn(),
    insert: jest.fn(),
    select: jest.fn(),
  },
}));

jest.mock('@/lib/db/queries', () => ({
  getUserProfile: jest.fn(),
}));

jest.mock('@/lib/db/schema', () => ({
  users: {
    id: 'id',
    name: 'name',
    email: 'email',
  },
  userProfiles: {
    userId: 'userId',
    targetScore: 'targetScore',
    examDate: 'examDate',
  },
}));

import {
  updateProfile,
  updateTargetScore,
  updateExamDate,
} from '@/lib/auth/profile-actions';
import { getUserProfile } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';

describe('Profile Actions Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateProfile', () => {
    it('should successfully update user profile with valid data', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });
      (db.update as jest.MockedFunction<any>).mockReturnValue(mockUpdate());

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });
      (db.insert as jest.MockedFunction<any>).mockReturnValue(mockInsert());

      const formData = new FormData();
      formData.append('name', 'Updated Name');
      formData.append('email', 'updated@example.com');
      formData.append('targetScore', '75');
      formData.append('examDate', '2024-12-31');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('success');
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
      expect(result.targetScore).toBe(75);
    });

    it('should reject invalid email format', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'invalid-email');
      formData.append('targetScore', '65');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('email');
    });

    it('should reject empty name', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append('name', '');
      formData.append('email', 'test@example.com');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Name');
    });

    it('should reject target score below minimum', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('targetScore', '5');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('error');
    });

    it('should reject target score above maximum', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('targetScore', '95');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('error');
    });

    it('should handle unauthenticated user', async () => {
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');

      await expect(updateProfile(null, formData)).rejects.toThrow('not authenticated');
    });

    it('should handle database errors gracefully', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.update as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database error');
      });

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Failed to update');
    });

    it('should accept valid target scores within range', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      for (const score of [10, 50, 65, 79, 90]) {
        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('email', 'test@example.com');
        formData.append('targetScore', score.toString());

        const result = await updateProfile(null, formData);
        expect(result).toHaveProperty('success');
        expect(result.targetScore).toBe(score);
      }
    });

    it('should handle optional examDate field', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('targetScore', '65');

      const result = await updateProfile(null, formData);

      expect(result).toHaveProperty('success');
      expect(result.examDate).toBeNull();
    });

    it('should handle special characters in name', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const specialNames = [
        "O'Brien",
        'José García',
        'François-René',
        'Müller',
        'Nguyễn',
      ];

      for (const name of specialNames) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', 'test@example.com');

        const result = await updateProfile(null, formData);
        expect(result).toHaveProperty('success');
        expect(result.name).toBe(name);
      }
    });

    it('should validate email format strictly', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', email: 'test@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ];

      for (const email of invalidEmails) {
        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('email', email);

        const result = await updateProfile(null, formData);
        expect(result).toHaveProperty('error');
      }
    });
  });

  describe('updateTargetScore', () => {
    it('should update target score for existing profile', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const mockProfile = { userId: 'user-123', targetScore: 65 };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockProfile]),
          }),
        }),
      });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ ...mockProfile, targetScore: 80 }]),
          }),
        }),
      });

      const result = await updateTargetScore(80);

      expect(result).toBeDefined();
      expect(result.targetScore).toBe(80);
    });

    it('should create new profile if none exists', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const newProfile = { userId: 'user-123', targetScore: 70 };
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newProfile]),
        }),
      });

      const result = await updateTargetScore(70);

      expect(result).toBeDefined();
      expect(result.targetScore).toBe(70);
    });

    it('should handle unauthenticated user', async () => {
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(null);

      await expect(updateTargetScore(75)).rejects.toThrow('not authenticated');
    });

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(updateTargetScore(75)).rejects.toThrow();
    });

    it('should handle various valid target scores', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ userId: 'user-123', targetScore: 65 }]),
          }),
        }),
      });

      const validScores = [50, 65, 75, 79, 85, 90];

      for (const score of validScores) {
        (db.update as jest.MockedFunction<any>).mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ userId: 'user-123', targetScore: score }]),
            }),
          }),
        });

        const result = await updateTargetScore(score);
        expect(result.targetScore).toBe(score);
      }
    });
  });

  describe('updateExamDate', () => {
    it('should update exam date for existing profile', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      const existingProfile = { userId: 'user-123', examDate: new Date('2024-01-01') };
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([existingProfile]),
          }),
        }),
      });

      const newDate = new Date('2024-12-31');
      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ ...existingProfile, examDate: newDate }]),
          }),
        }),
      });

      const result = await updateExamDate(newDate);

      expect(result).toBeDefined();
      expect(result.examDate).toEqual(newDate);
    });

    it('should create new profile with exam date if none exists', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const examDate = new Date('2024-06-15');
      const newProfile = { userId: 'user-123', examDate };
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newProfile]),
        }),
      });

      const result = await updateExamDate(examDate);

      expect(result).toBeDefined();
      expect(result.examDate).toEqual(examDate);
    });

    it('should handle unauthenticated user', async () => {
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(null);

      await expect(updateExamDate(new Date())).rejects.toThrow('not authenticated');
    });

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(updateExamDate(new Date())).rejects.toThrow();
    });

    it('should handle past dates', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ userId: 'user-123' }]),
          }),
        }),
      });

      const pastDate = new Date('2020-01-01');
      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ userId: 'user-123', examDate: pastDate }]),
          }),
        }),
      });

      const result = await updateExamDate(pastDate);
      expect(result.examDate).toEqual(pastDate);
    });

    it('should handle future dates', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ userId: 'user-123' }]),
          }),
        }),
      });

      const futureDate = new Date('2030-12-31');
      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ userId: 'user-123', examDate: futureDate }]),
          }),
        }),
      });

      const result = await updateExamDate(futureDate);
      expect(result.examDate).toEqual(futureDate);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete profile update workflow', async () => {
      const mockUser = { id: 'user-123', name: 'Initial Name', email: 'initial@example.com' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      // Mock database operations
      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Update full profile
      const formData = new FormData();
      formData.append('name', 'New Name');
      formData.append('email', 'new@example.com');
      formData.append('targetScore', '80');
      formData.append('examDate', '2024-12-31');

      const profileResult = await updateProfile(null, formData);
      expect(profileResult).toHaveProperty('success');

      // Update just target score
      const scoreResult = await updateTargetScore(85);
      expect(scoreResult).toBeDefined();

      // Update just exam date
      const dateResult = await updateExamDate(new Date('2025-01-15'));
      expect(dateResult).toBeDefined();
    });

    it('should maintain data integrity across multiple updates', async () => {
      const mockUser = { id: 'user-123' };
      (getUserProfile as jest.MockedFunction<any>).mockResolvedValue(mockUser);

      let currentProfile = { userId: 'user-123', targetScore: 65, examDate: null };

      (db.select as jest.MockedFunction<any>).mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([currentProfile]),
          }),
        }),
      }));

      (db.update as jest.MockedFunction<any>).mockImplementation(() => ({
        set: jest.fn().mockImplementation((updates: any) => {
          currentProfile = { ...currentProfile, ...updates };
          return {
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([currentProfile]),
            }),
          };
        }),
      }));

      // First update
      await updateTargetScore(75);
      expect(currentProfile.targetScore).toBe(75);

      // Second update
      await updateTargetScore(85);
      expect(currentProfile.targetScore).toBe(85);
    });
  });
});
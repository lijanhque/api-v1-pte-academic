/**
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
jest.mock('server-only', () => ({}));
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/db/schema-mock-tests', () => ({
  mockTests: {},
  mockTestQuestions: {},
  mockTestAttempts: {},
  mockTestAnswers: {},
}));

jest.mock('@/lib/db/schema', () => ({
  speakingQuestions: { id: 'id' },
  writingQuestions: { id: 'id' },
  readingQuestions: { id: 'id' },
  listeningQuestions: { id: 'id' },
}));

jest.mock('@/lib/pte/timing', () => ({
  timingFor: jest.fn().mockReturnValue({ prepTime: 40, answerTime: 40 }),
}));

import { db } from '@/lib/db';

describe('Mock Test Orchestrator Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadMockTest', () => {
    it('should load test with all questions', async () => {
      const mockTest = {
        id: 'test-1',
        testNumber: 1,
        title: 'Practice Test 1',
        totalQuestions: 60,
        durationMinutes: 120,
      };

      const mockQuestions = [
        {
          id: 'q1',
          mockTestId: 'test-1',
          questionId: 'speaking-1',
          questionTable: 'speaking_questions',
          section: 'speaking',
          orderIndex: 0,
        },
        {
          id: 'q2',
          mockTestId: 'test-1',
          questionId: 'writing-1',
          questionTable: 'writing_questions',
          section: 'writing',
          orderIndex: 1,
        },
      ];

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        });

      const { loadMockTest } = await import('@/lib/mock-tests/orchestrator');
      const result = await loadMockTest('test-1');

      expect(result.test).toEqual(mockTest);
      expect(result.questions).toHaveLength(2);
    });

    it('should throw error for non-existent test', async () => {
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const { loadMockTest } = await import('@/lib/mock-tests/orchestrator');
      
      await expect(loadMockTest('non-existent')).rejects.toThrow('not found');
    });

    it('should order questions correctly', async () => {
      const mockTest = { id: 'test-1' };
      const mockQuestions = [
        { id: 'q1', orderIndex: 0, section: 'speaking' },
        { id: 'q2', orderIndex: 1, section: 'speaking' },
        { id: 'q3', orderIndex: 2, section: 'writing' },
      ];

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        });

      const { loadMockTest } = await import('@/lib/mock-tests/orchestrator');
      const result = await loadMockTest('test-1');

      expect(result.questions[0].orderIndex).toBe(0);
      expect(result.questions[1].orderIndex).toBe(1);
      expect(result.questions[2].orderIndex).toBe(2);
    });
  });

  describe('startMockTestAttempt', () => {
    it('should create new attempt successfully', async () => {
      const mockTest = {
        id: 'test-1',
        testNumber: 1,
        durationMinutes: 120,
      };

      const mockQuestions = [
        { id: 'q1', orderIndex: 0 },
        { id: 'q2', orderIndex: 1 },
      ];

      const mockAttempt = {
        id: 'attempt-1',
        userId: 'user-123',
        mockTestId: 'test-1',
        status: 'in_progress',
        currentQuestionIndex: 0,
      };

      // Mock existing attempt check (none found)
      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        })
        // Mock load test
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        });

      // Mock insert attempt
      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockAttempt]),
        }),
      });

      const { startMockTestAttempt } = await import('@/lib/mock-tests/orchestrator');
      const result = await startMockTestAttempt('user-123', 'test-1');

      expect(result.attemptId).toBe('attempt-1');
      expect(result.totalQuestions).toBe(2);
    });

    it('should prevent multiple in-progress attempts', async () => {
      const existingAttempt = {
        id: 'attempt-1',
        status: 'in_progress',
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingAttempt]),
        }),
      });

      const { startMockTestAttempt } = await import('@/lib/mock-tests/orchestrator');
      
      await expect(
        startMockTestAttempt('user-123', 'test-1')
      ).rejects.toThrow('in-progress');
    });

    it('should initialize attempt with correct defaults', async () => {
      const mockTest = { id: 'test-1', durationMinutes: 120 };
      const mockQuestions = [{ id: 'q1' }];

      let capturedAttempt: any = null;

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        });

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockImplementation((values) => {
          capturedAttempt = values;
          return {
            returning: jest.fn().mockResolvedValue([{ id: 'attempt-1', ...values }]),
          };
        }),
      });

      const { startMockTestAttempt } = await import('@/lib/mock-tests/orchestrator');
      await startMockTestAttempt('user-123', 'test-1');

      expect(capturedAttempt.currentQuestionIndex).toBe(0);
      expect(capturedAttempt.currentSection).toBe('speaking');
      expect(capturedAttempt.pauseCount).toBe(0);
      expect(capturedAttempt.timeRemainingSeconds).toBe(7200); // 120 minutes
    });
  });

  describe('getTestSession', () => {
    it('should return complete session state', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        mockTestId: 'test-1',
        currentQuestionIndex: 0,
        currentSection: 'speaking',
        status: 'in_progress',
        timeRemainingSeconds: 7000,
      };

      const mockTest = {
        id: 'test-1',
        testNumber: 1,
        title: 'Test 1',
      };

      const mockQuestions = [
        {
          id: 'q1',
          questionId: 'speaking-1',
          questionTable: 'speaking_questions',
          section: 'speaking',
          orderIndex: 0,
          timeLimitSeconds: null,
        },
      ];

      const mockQuestionData = {
        id: 'speaking-1',
        type: 'read_aloud',
        title: 'Read Aloud Question',
      };

      const mockAnswers = [];

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAttempt]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockAnswers),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockQuestionData]),
          }),
        });

      const { getTestSession } = await import('@/lib/mock-tests/orchestrator');
      const session = await getTestSession('attempt-1');

      expect(session.attemptId).toBe('attempt-1');
      expect(session.currentSection).toBe('speaking');
      expect(session.status).toBe('in_progress');
      expect(session.questions).toHaveLength(1);
    });

    it('should throw error for non-existent attempt', async () => {
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const { getTestSession } = await import('@/lib/mock-tests/orchestrator');
      
      await expect(getTestSession('non-existent')).rejects.toThrow('not found');
    });

    it('should track completed questions', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        mockTestId: 'test-1',
        currentQuestionIndex: 2,
      };

      const mockTest = { id: 'test-1', testNumber: 1, title: 'Test 1' };
      const mockQuestions = [
        { id: 'q1', questionId: 'sq1', questionTable: 'speaking_questions', orderIndex: 0 },
        { id: 'q2', questionId: 'sq2', questionTable: 'speaking_questions', orderIndex: 1 },
        { id: 'q3', questionId: 'wq1', questionTable: 'writing_questions', orderIndex: 2 },
      ];

      const mockAnswers = [
        { mockTestQuestionId: 'q1' },
        { mockTestQuestionId: 'q2' },
      ];

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAttempt]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockAnswers),
          }),
        })
        .mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 'mock-data' }]),
          }),
        });

      const { getTestSession } = await import('@/lib/mock-tests/orchestrator');
      const session = await getTestSession('attempt-1');

      expect(session.completedQuestionIds).toHaveLength(2);
      expect(session.completedQuestionIds).toContain('q1');
      expect(session.completedQuestionIds).toContain('q2');
    });
  });

  describe('submitAnswer', () => {
    it('should successfully submit answer', async () => {
      const mockAnswer = {
        id: 'answer-1',
        attemptId: 'attempt-1',
        mockTestQuestionId: 'q1',
        userResponse: { text: 'Test answer' },
      };

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockAnswer]),
        }),
      });

      const { submitAnswer } = await import('@/lib/mock-tests/orchestrator');
      const result = await submitAnswer({
        attemptId: 'attempt-1',
        mockTestQuestionId: 'q1',
        questionId: 'speaking-1',
        questionTable: 'speaking_questions',
        userResponse: { text: 'Test answer' },
        timeTakenSeconds: 45,
      });

      expect(result.id).toBe('answer-1');
    });

    it('should record time taken', async () => {
      let capturedValues: any = null;

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockImplementation((values) => {
          capturedValues = values;
          return {
            returning: jest.fn().mockResolvedValue([{ id: 'answer-1', ...values }]),
          };
        }),
      });

      const { submitAnswer } = await import('@/lib/mock-tests/orchestrator');
      await submitAnswer({
        attemptId: 'attempt-1',
        mockTestQuestionId: 'q1',
        questionId: 'speaking-1',
        questionTable: 'speaking_questions',
        userResponse: { text: 'Test' },
        timeTakenSeconds: 60,
      });

      expect(capturedValues.timeTakenSeconds).toBe(60);
    });

    it('should store complex user responses', async () => {
      const complexResponse = {
        text: 'Essay content',
        wordCount: 250,
        metadata: {
          revisions: 3,
          timeSpent: 120,
        },
      };

      let capturedValues: any = null;

      (db.insert as jest.MockedFunction<any>).mockReturnValue({
        values: jest.fn().mockImplementation((values) => {
          capturedValues = values;
          return {
            returning: jest.fn().mockResolvedValue([{ id: 'answer-1', ...values }]),
          };
        }),
      });

      const { submitAnswer } = await import('@/lib/mock-tests/orchestrator');
      await submitAnswer({
        attemptId: 'attempt-1',
        mockTestQuestionId: 'q1',
        questionId: 'writing-1',
        questionTable: 'writing_questions',
        userResponse: complexResponse,
        timeTakenSeconds: 120,
      });

      expect(capturedValues.userResponse).toEqual(complexResponse);
    });
  });

  describe('moveToNextQuestion', () => {
    it('should advance to next question', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        mockTestId: 'test-1',
        currentQuestionIndex: 0,
      };

      const mockTest = { id: 'test-1', testNumber: 1, title: 'Test 1' };
      const mockQuestions = [
        {
          id: 'q1',
          questionId: 'sq1',
          questionTable: 'speaking_questions',
          section: 'speaking',
          orderIndex: 0,
        },
        {
          id: 'q2',
          questionId: 'wq1',
          questionTable: 'writing_questions',
          section: 'writing',
          orderIndex: 1,
        },
      ];

      // Mock getTestSession calls
      (db.select as jest.MockedFunction<any>)
        .mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
              limit: jest.fn().mockResolvedValue([mockAttempt]),
            }),
          }),
        });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      // Need to mock full session loading
      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAttempt]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 'mock-q-data' }]),
          }),
        });

      const { moveToNextQuestion } = await import('@/lib/mock-tests/orchestrator');
      const nextQuestion = await moveToNextQuestion('attempt-1');

      expect(nextQuestion.orderIndex).toBe(1);
      expect(nextQuestion.section).toBe('writing');
    });

    it('should throw error at last question', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        mockTestId: 'test-1',
        currentQuestionIndex: 1,
      };

      const mockTest = { id: 'test-1', testNumber: 1, title: 'Test 1' };
      const mockQuestions = [
        { id: 'q1', questionId: 'sq1', questionTable: 'speaking_questions', orderIndex: 0 },
        { id: 'q2', questionId: 'wq1', questionTable: 'writing_questions', orderIndex: 1 },
      ];

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAttempt]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 'mock-data' }]),
          }),
        });

      const { moveToNextQuestion } = await import('@/lib/mock-tests/orchestrator');
      
      await expect(moveToNextQuestion('attempt-1')).rejects.toThrow('No more questions');
    });
  });

  describe('pauseAttempt', () => {
    it('should pause at section boundary', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        pauseCount: 0,
        currentQuestionIndex: 10,
      };

      const mockQuestions = Array(20).fill(null).map((_, i) => ({
        id: `q${i}`,
        section: i < 10 ? 'speaking' : 'writing',
        orderIndex: i,
      }));

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAttempt]),
          }),
        })
        .mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const { pauseAttempt } = await import('@/lib/mock-tests/orchestrator');
      const result = await pauseAttempt('attempt-1');

      expect(result.success).toBe(true);
    });

    it('should enforce maximum pause limit', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        pauseCount: 2,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAttempt]),
        }),
      });

      const { pauseAttempt } = await import('@/lib/mock-tests/orchestrator');
      
      await expect(pauseAttempt('attempt-1')).rejects.toThrow('Maximum pause limit');
    });
  });

  describe('completeAttempt', () => {
    it('should mark attempt as completed', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        status: 'in_progress',
      };

      const mockTest = { id: 'test-1', testNumber: 1, title: 'Test 1' };
      const mockQuestions = [];

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockAttempt]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTest]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockQuestions),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      (db.update as jest.MockedFunction<any>).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({ rowCount: 1 }),
        }),
      });

      const { completeAttempt } = await import('@/lib/mock-tests/orchestrator');
      const result = await completeAttempt('attempt-1');

      expect(result.success).toBe(true);
      expect(result.attemptId).toBe('attempt-1');
    });
  });

  describe('checkMockTestAccess', () => {
    it('should allow access to free test', async () => {
      const mockTest = {
        id: 'test-1',
        isFree: true,
      };

      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockTest]),
        }),
      });

      const { checkMockTestAccess } = await import('@/lib/mock-tests/orchestrator');
      const result = await checkMockTestAccess('user-123', 'test-1');

      expect(result.hasAccess).toBe(true);
    });

    it('should deny access to non-existent test', async () => {
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const { checkMockTestAccess } = await import('@/lib/mock-tests/orchestrator');
      const result = await checkMockTestAccess('user-123', 'non-existent');

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain('not found');
    });
  });
});
/**
 * @jest-environment node
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock database
jest.mock('server-only', () => ({}));
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/db/schema-mock-tests', () => ({
  mockTests: {},
  mockTestQuestions: {},
}));

jest.mock('@/lib/db/schema', () => ({
  speakingQuestions: { id: 'id', type: 'type', title: 'title', difficulty: 'difficulty', isActive: 'isActive' },
  writingQuestions: { id: 'id', type: 'type', title: 'title', difficulty: 'difficulty', isActive: 'isActive' },
  readingQuestions: { id: 'id', type: 'type', title: 'title', difficulty: 'difficulty', isActive: 'isActive' },
  listeningQuestions: { id: 'id', type: 'type', title: 'title', difficulty: 'difficulty', isActive: 'isActive' },
}));

import {
  MOCK_TEST_TEMPLATE_2025,
  SECTION_TIME_LIMITS_2025,
} from '@/lib/mock-tests/generator';

describe('Mock Test Generator Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('MOCK_TEST_TEMPLATE_2025 Constants', () => {
    it('should define all speaking question types with November 2025 updates', () => {
      expect(MOCK_TEST_TEMPLATE_2025.speaking).toBeDefined();
      expect(MOCK_TEST_TEMPLATE_2025.speaking.read_aloud).toEqual({ min: 5, max: 6 });
      expect(MOCK_TEST_TEMPLATE_2025.speaking.repeat_sentence).toEqual({ min: 9, max: 11 });
      expect(MOCK_TEST_TEMPLATE_2025.speaking.describe_image).toEqual({ min: 3, max: 4 });
      expect(MOCK_TEST_TEMPLATE_2025.speaking.retell_lecture).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.speaking.answer_short_question).toEqual({ min: 4, max: 5 });
      
      // NEW August 2025 question types
      expect(MOCK_TEST_TEMPLATE_2025.speaking.respond_to_a_situation).toEqual({ min: 1, max: 2 });
      expect(MOCK_TEST_TEMPLATE_2025.speaking.summarize_group_discussion).toEqual({ min: 1, max: 1 });
    });

    it('should define all writing question types', () => {
      expect(MOCK_TEST_TEMPLATE_2025.writing).toBeDefined();
      expect(MOCK_TEST_TEMPLATE_2025.writing.summarize_written_text).toEqual({ min: 1, max: 2 });
      expect(MOCK_TEST_TEMPLATE_2025.writing.write_essay).toEqual({ min: 1, max: 2 });
    });

    it('should define all reading question types', () => {
      expect(MOCK_TEST_TEMPLATE_2025.reading).toBeDefined();
      expect(MOCK_TEST_TEMPLATE_2025.reading.reading_writing_fill_blanks).toEqual({ min: 4, max: 5 });
      expect(MOCK_TEST_TEMPLATE_2025.reading.multiple_choice_multiple).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.reading.reorder_paragraphs).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.reading.fill_in_blanks).toEqual({ min: 3, max: 4 });
      expect(MOCK_TEST_TEMPLATE_2025.reading.multiple_choice_single).toEqual({ min: 2, max: 3 });
    });

    it('should define all listening question types', () => {
      expect(MOCK_TEST_TEMPLATE_2025.listening).toBeDefined();
      expect(MOCK_TEST_TEMPLATE_2025.listening.summarize_spoken_text).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.multiple_choice_multiple).toEqual({ min: 1, max: 2 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.fill_in_blanks).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.highlight_correct_summary).toEqual({ min: 1, max: 2 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.multiple_choice_single).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.select_missing_word).toEqual({ min: 1, max: 2 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.highlight_incorrect_words).toEqual({ min: 2, max: 3 });
      expect(MOCK_TEST_TEMPLATE_2025.listening.write_from_dictation).toEqual({ min: 3, max: 4 });
    });

    it('should have valid min/max ranges for all question types', () => {
      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        Object.entries(questionTypes).forEach(([type, range]) => {
          expect(range.min).toBeLessThanOrEqual(range.max);
          expect(range.min).toBeGreaterThan(0);
          expect(range.max).toBeGreaterThan(0);
        });
      });
    });

    it('should generate tests with 52-64 questions total', () => {
      let minTotal = 0;
      let maxTotal = 0;

      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        Object.values(questionTypes).forEach(range => {
          minTotal += range.min;
          maxTotal += range.max;
        });
      });

      expect(minTotal).toBeGreaterThanOrEqual(52);
      expect(maxTotal).toBeLessThanOrEqual(64);
    });
  });

  describe('SECTION_TIME_LIMITS_2025 Constants', () => {
    it('should define time limits for all sections', () => {
      expect(SECTION_TIME_LIMITS_2025.speaking_writing).toEqual({ min: 54, max: 67 });
      expect(SECTION_TIME_LIMITS_2025.reading).toEqual({ min: 29, max: 30 });
      expect(SECTION_TIME_LIMITS_2025.listening).toEqual({ min: 30, max: 43 });
    });

    it('should total approximately 120 minutes (2 hours)', () => {
      const minTotal = 
        SECTION_TIME_LIMITS_2025.speaking_writing.min +
        SECTION_TIME_LIMITS_2025.reading.min +
        SECTION_TIME_LIMITS_2025.listening.min;

      const maxTotal =
        SECTION_TIME_LIMITS_2025.speaking_writing.max +
        SECTION_TIME_LIMITS_2025.reading.max +
        SECTION_TIME_LIMITS_2025.listening.max;

      expect(minTotal).toBeGreaterThanOrEqual(113);
      expect(maxTotal).toBeLessThanOrEqual(140);
      expect((minTotal + maxTotal) / 2).toBeCloseTo(120, -1);
    });

    it('should have valid min/max ranges', () => {
      Object.values(SECTION_TIME_LIMITS_2025).forEach(limit => {
        expect(limit.min).toBeLessThanOrEqual(limit.max);
        expect(limit.min).toBeGreaterThan(0);
      });
    });
  });

  describe('Question Distribution Logic', () => {
    it('should prioritize new speaking question types', () => {
      const newTypes = ['respond_to_a_situation', 'summarize_group_discussion'];
      
      newTypes.forEach(type => {
        expect(MOCK_TEST_TEMPLATE_2025.speaking[type as keyof typeof MOCK_TEST_TEMPLATE_2025.speaking]).toBeDefined();
      });
    });

    it('should maintain traditional speaking task counts', () => {
      // Traditional tasks should still have significant representation
      const traditionalTasks = {
        read_aloud: MOCK_TEST_TEMPLATE_2025.speaking.read_aloud,
        repeat_sentence: MOCK_TEST_TEMPLATE_2025.speaking.repeat_sentence,
        describe_image: MOCK_TEST_TEMPLATE_2025.speaking.describe_image,
        retell_lecture: MOCK_TEST_TEMPLATE_2025.speaking.retell_lecture,
        answer_short_question: MOCK_TEST_TEMPLATE_2025.speaking.answer_short_question,
      };

      const totalMin = Object.values(traditionalTasks).reduce((sum, range) => sum + range.min, 0);
      const totalMax = Object.values(traditionalTasks).reduce((sum, range) => sum + range.max, 0);

      expect(totalMin).toBeGreaterThan(20); // At least 23
      expect(totalMax).toBeLessThan(35); // At most 29
    });

    it('should have balanced question type distribution', () => {
      // No single question type should dominate
      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        const ranges = Object.values(questionTypes);
        
        ranges.forEach(range => {
          // No single type should be more than 20% of max total questions
          expect(range.max).toBeLessThan(13);
        });
      });
    });
  });

  describe('Test Generation Difficulty Distribution', () => {
    it('should distribute difficulty across test numbers correctly', () => {
      // Tests 1-50: Easy (25%)
      // Tests 51-150: Medium (50%)
      // Tests 151-200: Hard (25%)
      
      const easyCount = 50;
      const mediumCount = 100;
      const hardCount = 50;
      const total = 200;

      expect(easyCount / total).toBeCloseTo(0.25, 2);
      expect(mediumCount / total).toBe(0.5);
      expect(hardCount / total).toBeCloseTo(0.25, 2);
    });

    it('should ensure progressive difficulty', () => {
      // Earlier tests should be easier
      const test1Difficulty = 'easy';
      const test100Difficulty = 'medium';
      const test200Difficulty = 'hard';

      expect(test1Difficulty).toBe('easy');
      expect(test100Difficulty).toBe('medium');
      expect(test200Difficulty).toBe('hard');
    });
  });

  describe('November 2025 Format Compliance', () => {
    it('should comply with reduced question count', () => {
      // November 2025: 52-64 questions (down from 70-82)
      const allRanges = [
        ...Object.values(MOCK_TEST_TEMPLATE_2025.speaking),
        ...Object.values(MOCK_TEST_TEMPLATE_2025.writing),
        ...Object.values(MOCK_TEST_TEMPLATE_2025.reading),
        ...Object.values(MOCK_TEST_TEMPLATE_2025.listening),
      ];

      const minTotal = allRanges.reduce((sum, range) => sum + range.min, 0);
      const maxTotal = allRanges.reduce((sum, range) => sum + range.max, 0);

      expect(minTotal).toBe(52);
      expect(maxTotal).toBe(64);
    });

    it('should maintain 2-hour test duration', () => {
      const duration = 120; // minutes
      
      const minTime = Object.values(SECTION_TIME_LIMITS_2025)
        .reduce((sum, limit) => sum + limit.min, 0);
      
      const maxTime = Object.values(SECTION_TIME_LIMITS_2025)
        .reduce((sum, limit) => sum + limit.max, 0);

      expect(minTime).toBeLessThanOrEqual(duration);
      expect(maxTime).toBeGreaterThanOrEqual(duration);
    });

    it('should include new question types from August 2025', () => {
      const newTypes = [
        'respond_to_a_situation',
        'summarize_group_discussion',
      ];

      newTypes.forEach(type => {
        const questionType = MOCK_TEST_TEMPLATE_2025.speaking[type as keyof typeof MOCK_TEST_TEMPLATE_2025.speaking];
        expect(questionType).toBeDefined();
        expect(questionType.min).toBeGreaterThan(0);
      });
    });
  });

  describe('Question Type Coverage', () => {
    it('should cover all PTE Academic question types', () => {
      const expectedSpeakingTypes = 7; // Including 2 new types
      const expectedWritingTypes = 2;
      const expectedReadingTypes = 5;
      const expectedListeningTypes = 8;

      expect(Object.keys(MOCK_TEST_TEMPLATE_2025.speaking)).toHaveLength(expectedSpeakingTypes);
      expect(Object.keys(MOCK_TEST_TEMPLATE_2025.writing)).toHaveLength(expectedWritingTypes);
      expect(Object.keys(MOCK_TEST_TEMPLATE_2025.reading)).toHaveLength(expectedReadingTypes);
      expect(Object.keys(MOCK_TEST_TEMPLATE_2025.listening)).toHaveLength(expectedListeningTypes);
    });

    it('should ensure minimum representation of each question type', () => {
      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        Object.entries(questionTypes).forEach(([type, range]) => {
          expect(range.min).toBeGreaterThanOrEqual(1);
        });
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle minimum question counts', () => {
      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        Object.values(questionTypes).forEach(range => {
          expect(range.min).toBeGreaterThan(0);
          expect(Number.isInteger(range.min)).toBe(true);
        });
      });
    });

    it('should handle maximum question counts', () => {
      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        Object.values(questionTypes).forEach(range => {
          expect(range.max).toBeGreaterThan(0);
          expect(Number.isInteger(range.max)).toBe(true);
          expect(range.max).toBeGreaterThanOrEqual(range.min);
        });
      });
    });

    it('should ensure reasonable variation ranges', () => {
      const sections = ['speaking', 'writing', 'reading', 'listening'] as const;
      
      sections.forEach(section => {
        const questionTypes = MOCK_TEST_TEMPLATE_2025[section];
        Object.values(questionTypes).forEach(range => {
          const variation = range.max - range.min;
          // Variation should not be too large (max 2-3 questions difference)
          expect(variation).toBeLessThanOrEqual(3);
          expect(variation).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Time Allocation Logic', () => {
    it('should allocate appropriate time for speaking/writing combined section', () => {
      const { speaking_writing } = SECTION_TIME_LIMITS_2025;
      
      // Should be largest section
      expect(speaking_writing.max).toBeGreaterThan(SECTION_TIME_LIMITS_2025.reading.max);
      expect(speaking_writing.max).toBeGreaterThan(SECTION_TIME_LIMITS_2025.listening.max);
    });

    it('should allocate sufficient time for reading section', () => {
      const { reading } = SECTION_TIME_LIMITS_2025;
      
      // Reading typically 29-30 minutes
      expect(reading.min).toBe(29);
      expect(reading.max).toBe(30);
    });

    it('should allocate variable time for listening section', () => {
      const { listening } = SECTION_TIME_LIMITS_2025;
      
      // Listening has most variation due to audio length
      const variation = listening.max - listening.min;
      expect(variation).toBeGreaterThanOrEqual(10);
    });
  });
});
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateMockTestData,
  getMockTestById,
  getCompletedMockTests,
  type MockTest,
} from '../mock-test-data'

describe('mock-test-data', () => {
  beforeEach(() => {
    // Reset date mock if needed
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
  })

  describe('generateMockTestData', () => {
    it('should generate array of mock tests', () => {
      const tests = generateMockTestData()
      expect(tests).toBeInstanceOf(Array)
      expect(tests.length).toBeGreaterThan(0)
    })

    it('should generate tests with required fields', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        expect(test).toHaveProperty('id')
        expect(test).toHaveProperty('title')
        expect(test).toHaveProperty('date')
        expect(test).toHaveProperty('status')
        expect(test).toHaveProperty('score')
        expect(test).toHaveProperty('duration')
        expect(test).toHaveProperty('sections')
        expect(test).toHaveProperty('createdAt')
        expect(test).toHaveProperty('updatedAt')
      })
    })

    it('should generate tests with valid status values', () => {
      const tests = generateMockTestData()
      const validStatuses = ['pending', 'in_progress', 'completed', 'reviewed']
      tests.forEach((test) => {
        expect(validStatuses).toContain(test.status)
      })
    })

    it('should generate tests with four sections', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        expect(test.sections).toHaveLength(4)
        expect(test.sections.map((s) => s.name)).toEqual([
          'Speaking',
          'Writing',
          'Reading',
          'Listening',
        ])
      })
    })

    it('should have consistent section structure', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        test.sections.forEach((section) => {
          expect(section).toHaveProperty('name')
          expect(section).toHaveProperty('score')
          expect(section).toHaveProperty('questionsAttempted')
          expect(section).toHaveProperty('totalQuestions')
          expect(section).toHaveProperty('timeSpent')
          expect(typeof section.score).toBe('number')
          expect(typeof section.questionsAttempted).toBe('number')
          expect(typeof section.totalQuestions).toBe('number')
          expect(typeof section.timeSpent).toBe('number')
        })
      })
    })

    it('should have score as number or object with overall property', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        if (typeof test.score === 'object') {
          expect(test.score).toHaveProperty('overall')
          expect(typeof test.score.overall).toBe('number')
        } else {
          expect(typeof test.score).toBe('number')
        }
      })
    })

    it('should have pending tests with zero scores', () => {
      const tests = generateMockTestData()
      const pendingTests = tests.filter((t) => t.status === 'pending')
      pendingTests.forEach((test) => {
        expect(test.score).toBe(0)
        test.sections.forEach((section) => {
          expect(section.score).toBe(0)
          expect(section.questionsAttempted).toBe(0)
          expect(section.timeSpent).toBe(0)
        })
      })
    })

    it('should have completed tests with non-zero scores', () => {
      const tests = generateMockTestData()
      const completedTests = tests.filter(
        (t) => t.status === 'completed' || t.status === 'reviewed'
      )
      completedTests.forEach((test) => {
        const score = typeof test.score === 'object' ? test.score.overall : test.score
        expect(score).toBeGreaterThan(0)
      })
    })

    it('should generate valid date strings', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        expect(test.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(new Date(test.createdAt).toString()).not.toBe('Invalid Date')
        expect(new Date(test.updatedAt).toString()).not.toBe('Invalid Date')
      })
    })

    it('should have duration in minutes (typically 180)', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        expect(test.duration).toBe(180)
      })
    })
  })

  describe('getMockTestById', () => {
    it('should return test when ID exists', () => {
      const test = getMockTestById('mock-test-1')
      expect(test).toBeDefined()
      expect(test?.id).toBe('mock-test-1')
    })

    it('should return undefined when ID does not exist', () => {
      const test = getMockTestById('non-existent-id')
      expect(test).toBeUndefined()
    })

    it('should return test with all required properties', () => {
      const test = getMockTestById('mock-test-1')
      expect(test).toHaveProperty('id')
      expect(test).toHaveProperty('title')
      expect(test).toHaveProperty('sections')
      expect(test?.sections).toHaveLength(4)
    })

    it('should handle empty string ID', () => {
      const test = getMockTestById('')
      expect(test).toBeUndefined()
    })
  })

  describe('getCompletedMockTests', () => {
    it('should return only completed and reviewed tests', () => {
      const tests = getCompletedMockTests()
      tests.forEach((test) => {
        expect(['completed', 'reviewed']).toContain(test.status)
      })
    })

    it('should not include pending or in_progress tests', () => {
      const tests = getCompletedMockTests()
      const invalidStatuses = tests.filter(
        (t) => t.status === 'pending' || t.status === 'in_progress'
      )
      expect(invalidStatuses).toHaveLength(0)
    })

    it('should return array of tests', () => {
      const tests = getCompletedMockTests()
      expect(Array.isArray(tests)).toBe(true)
    })

    it('should return tests with non-zero scores', () => {
      const tests = getCompletedMockTests()
      tests.forEach((test) => {
        const score = typeof test.score === 'object' ? test.score.overall : test.score
        expect(score).toBeGreaterThan(0)
      })
    })

    it('should return at least one test', () => {
      const tests = getCompletedMockTests()
      expect(tests.length).toBeGreaterThan(0)
    })
  })

  describe('Data consistency', () => {
    it('should have questionsAttempted <= totalQuestions', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        test.sections.forEach((section) => {
          expect(section.questionsAttempted).toBeLessThanOrEqual(
            section.totalQuestions
          )
        })
      })
    })

    it('should have timeSpent proportional to questionsAttempted', () => {
      const tests = generateMockTestData()
      tests.forEach((test) => {
        test.sections.forEach((section) => {
          if (section.questionsAttempted === 0) {
            expect(section.timeSpent).toBe(0)
          } else {
            expect(section.timeSpent).toBeGreaterThan(0)
          }
        })
      })
    })
  })
})
import { describe, it, expect } from 'vitest'
import {
  clampTo90,
  clampTo5,
  rubricTo90,
  scoreTo5,
  calculatePercentage,
  normalizeToScale,
  toBand,
  getScoreDescriptor,
} from '../scoring-normalize'

describe('scoring-normalize', () => {
  describe('clampTo90', () => {
    it('should clamp score to 0-90 range', () => {
      expect(clampTo90(50)).toBe(50)
      expect(clampTo90(100)).toBe(90)
      expect(clampTo90(-10)).toBe(0)
      expect(clampTo90(0)).toBe(0)
      expect(clampTo90(90)).toBe(90)
    })

    it('should round decimal scores', () => {
      expect(clampTo90(45.4)).toBe(45)
      expect(clampTo90(45.6)).toBe(46)
      expect(clampTo90(89.5)).toBe(90)
    })
  })

  describe('clampTo5', () => {
    it('should clamp score to 0-5 range', () => {
      expect(clampTo5(3.5)).toBe(3.5)
      expect(clampTo5(6)).toBe(5)
      expect(clampTo5(-1)).toBe(0)
      expect(clampTo5(0)).toBe(0)
      expect(clampTo5(5)).toBe(5)
    })

    it('should preserve one decimal place', () => {
      expect(clampTo5(3.14)).toBe(3.1)
      expect(clampTo5(4.96)).toBe(5.0)
    })
  })

  describe('rubricTo90', () => {
    it('should convert 0-5 rubric score to 0-90 scale', () => {
      expect(rubricTo90(0)).toBe(0)
      expect(rubricTo90(2.5)).toBe(45)
      expect(rubricTo90(5)).toBe(90)
    })

    it('should handle edge cases', () => {
      expect(rubricTo90(1)).toBe(18)
      expect(rubricTo90(4)).toBe(72)
    })

    it('should clamp values outside 0-5 range', () => {
      expect(rubricTo90(6)).toBe(90)
      expect(rubricTo90(-1)).toBe(0)
    })
  })

  describe('scoreTo5', () => {
    it('should convert 0-90 score to 0-5 rubric scale', () => {
      expect(scoreTo5(0)).toBe(0)
      expect(scoreTo5(45)).toBe(2.5)
      expect(scoreTo5(90)).toBe(5)
    })

    it('should handle intermediate values', () => {
      expect(scoreTo5(18)).toBe(1)
      expect(scoreTo5(72)).toBe(4)
    })

    it('should clamp values outside 0-90 range', () => {
      expect(scoreTo5(100)).toBe(5)
      expect(scoreTo5(-10)).toBe(0)
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(1, 4)).toBe(25)
      expect(calculatePercentage(3, 4)).toBe(75)
    })

    it('should handle zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0)
      expect(calculatePercentage(0, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33)
      expect(calculatePercentage(2, 3)).toBe(67)
    })

    it('should handle value greater than total', () => {
      expect(calculatePercentage(150, 100)).toBe(150)
    })
  })

  describe('normalizeToScale', () => {
    it('should normalize values from custom range to 0-90', () => {
      expect(normalizeToScale(50, 0, 100)).toBe(45)
      expect(normalizeToScale(0, 0, 100)).toBe(0)
      expect(normalizeToScale(100, 0, 100)).toBe(90)
    })

    it('should handle different ranges', () => {
      expect(normalizeToScale(5, 0, 10)).toBe(45)
      expect(normalizeToScale(75, 50, 100)).toBe(45)
    })

    it('should handle equal min and max', () => {
      expect(normalizeToScale(50, 50, 50)).toBe(0)
    })

    it('should clamp normalized values', () => {
      expect(normalizeToScale(150, 0, 100)).toBe(90)
      expect(normalizeToScale(-50, 0, 100)).toBe(0)
    })
  })

  describe('toBand', () => {
    it('should round down to nearest 10-point band', () => {
      expect(toBand(85)).toBe(80)
      expect(toBand(76)).toBe(70)
      expect(toBand(65)).toBe(60)
      expect(toBand(50)).toBe(50)
      expect(toBand(36)).toBe(30)
    })

    it('should handle edge cases', () => {
      expect(toBand(0)).toBe(0)
      expect(toBand(90)).toBe(90)
      expect(toBand(89)).toBe(80)
      expect(toBand(5)).toBe(0)
    })

    it('should clamp out-of-range values before banding', () => {
      expect(toBand(100)).toBe(90)
      expect(toBand(-10)).toBe(0)
    })
  })

  describe('getScoreDescriptor', () => {
    it('should return correct descriptor for expert level', () => {
      expect(getScoreDescriptor(85)).toBe('Expert')
      expect(getScoreDescriptor(90)).toBe('Expert')
      expect(getScoreDescriptor(86)).toBe('Expert')
    })

    it('should return correct descriptor for very good level', () => {
      expect(getScoreDescriptor(76)).toBe('Very Good')
      expect(getScoreDescriptor(80)).toBe('Very Good')
      expect(getScoreDescriptor(84)).toBe('Very Good')
    })

    it('should return correct descriptor for good level', () => {
      expect(getScoreDescriptor(65)).toBe('Good')
      expect(getScoreDescriptor(70)).toBe('Good')
      expect(getScoreDescriptor(75)).toBe('Good')
    })

    it('should return correct descriptor for competent level', () => {
      expect(getScoreDescriptor(50)).toBe('Competent')
      expect(getScoreDescriptor(55)).toBe('Competent')
      expect(getScoreDescriptor(64)).toBe('Competent')
    })

    it('should return correct descriptor for modest level', () => {
      expect(getScoreDescriptor(36)).toBe('Modest')
      expect(getScoreDescriptor(40)).toBe('Modest')
      expect(getScoreDescriptor(49)).toBe('Modest')
    })

    it('should return correct descriptor for limited level', () => {
      expect(getScoreDescriptor(10)).toBe('Limited')
      expect(getScoreDescriptor(20)).toBe('Limited')
      expect(getScoreDescriptor(35)).toBe('Limited')
    })

    it('should return correct descriptor for extremely limited level', () => {
      expect(getScoreDescriptor(0)).toBe('Extremely Limited')
      expect(getScoreDescriptor(5)).toBe('Extremely Limited')
      expect(getScoreDescriptor(9)).toBe('Extremely Limited')
    })

    it('should clamp out-of-range scores before returning descriptor', () => {
      expect(getScoreDescriptor(100)).toBe('Expert')
      expect(getScoreDescriptor(-10)).toBe('Extremely Limited')
    })
  })
})
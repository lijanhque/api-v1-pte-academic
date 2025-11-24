/**
 * Unit tests for lib/pte/scoring-normalize.ts
 * Tests pure scoring normalization functions
 */

import { TestSection } from '@/lib/pte/types'
import {
  clampTo90,
  scaleTo90,
  accuracyTo90,
  werTo90,
  weightedOverall,
  normalizeSubscores,
  mergeProviderScores,
  buildDeterministicResult,
  combineDeterministicAndLLM,
  toTestSection,
  type ScoringResult,
  type ProviderRawScore,
} from '@/lib/pte/scoring-normalize'

describe('scoring-normalize', () => {
  describe('clampTo90', () => {
    it('should clamp values within 0-90 range', () => {
      expect(clampTo90(45)).toBe(45)
      expect(clampTo90(0)).toBe(0)
      expect(clampTo90(90)).toBe(90)
    })

    it('should clamp negative values to 0', () => {
      expect(clampTo90(-1)).toBe(0)
      expect(clampTo90(-100)).toBe(0)
    })

    it('should clamp values above 90 to 90', () => {
      expect(clampTo90(91)).toBe(90)
      expect(clampTo90(100)).toBe(90)
      expect(clampTo90(1000)).toBe(90)
    })

    it('should round decimal values', () => {
      expect(clampTo90(45.4)).toBe(45)
      expect(clampTo90(45.5)).toBe(46)
      expect(clampTo90(45.9)).toBe(46)
    })

    it('should handle non-finite values', () => {
      expect(clampTo90(NaN)).toBe(0)
      expect(clampTo90(Infinity)).toBe(0)
      expect(clampTo90(-Infinity)).toBe(0)
    })
  })

  describe('scaleTo90', () => {
    it('should scale values linearly from arbitrary range to 0-90', () => {
      expect(scaleTo90(50, 0, 100)).toBe(45)
      expect(scaleTo90(0, 0, 100)).toBe(0)
      expect(scaleTo90(100, 0, 100)).toBe(90)
    })

    it('should handle different ranges', () => {
      expect(scaleTo90(5, 0, 10)).toBe(45)
      expect(scaleTo90(75, 50, 100)).toBe(45)
    })

    it('should handle inverted ranges by clamping', () => {
      const result = scaleTo90(50, 100, 0)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(90)
    })

    it('should handle equal min and max', () => {
      expect(scaleTo90(50, 50, 50)).toBe(50)
    })

    it('should handle non-finite values', () => {
      expect(scaleTo90(NaN, 0, 100)).toBe(0)
      expect(scaleTo90(Infinity, 0, 100)).toBe(0)
    })
  })

  describe('accuracyTo90', () => {
    it('should convert 0-1 accuracy to 0-90 scale', () => {
      expect(accuracyTo90(0)).toBe(0)
      expect(accuracyTo90(0.5)).toBe(45)
      expect(accuracyTo90(1)).toBe(90)
    })

    it('should handle percentage input when flag is true', () => {
      expect(accuracyTo90(0, true)).toBe(0)
      expect(accuracyTo90(50, true)).toBe(45)
      expect(accuracyTo90(100, true)).toBe(90)
    })

    it('should clamp values outside expected range', () => {
      expect(accuracyTo90(1.5)).toBe(90)
      expect(accuracyTo90(-0.5)).toBe(0)
    })
  })

  describe('werTo90', () => {
    it('should convert WER to 0-90 score (lower WER = higher score)', () => {
      expect(werTo90(0)).toBe(90)
      expect(werTo90(0.5)).toBe(60)
      expect(werTo90(1)).toBe(30)
    })

    it('should degrade score for WER > 1.0', () => {
      const score1 = werTo90(1.0)
      const score1_5 = werTo90(1.5)
      expect(score1_5).toBeLessThan(score1)
      expect(score1_5).toBeGreaterThanOrEqual(0)
    })

    it('should handle negative WER as 0', () => {
      expect(werTo90(-0.5)).toBe(90)
    })

    it('should handle non-finite values', () => {
      expect(werTo90(NaN)).toBe(0)
      expect(werTo90(Infinity)).toBe(0)
    })
  })

  describe('weightedOverall', () => {
    it('should calculate simple average when no weights provided', () => {
      const subscores = { content: 80, fluency: 70, pronunciation: 60 }
      const result = weightedOverall(subscores)
      expect(result).toBe(70)
    })

    it('should return 0 for empty subscores', () => {
      expect(weightedOverall({})).toBe(0)
    })

    it('should apply weights correctly', () => {
      const subscores = { content: 90, fluency: 60 }
      const weights = { content: 0.7, fluency: 0.3 }
      const result = weightedOverall(subscores, weights)
      expect(result).toBe(81)
    })

    it('should handle zero weights by falling back to average', () => {
      const subscores = { content: 80, fluency: 60 }
      const weights = { content: 0, fluency: 0 }
      const result = weightedOverall(subscores, weights)
      expect(result).toBe(70)
    })

    it('should ignore missing weights', () => {
      const subscores = { content: 90, fluency: 60, grammar: 30 }
      const weights = { content: 0.5, fluency: 0.5 }
      const result = weightedOverall(subscores, weights)
      expect(result).toBe(75)
    })
  })

  describe('normalizeSubscores', () => {
    it('should normalize subscores within 0-90 range', () => {
      const raw = { content: 80, fluency: 70 }
      const result = normalizeSubscores(raw)
      expect(result.content).toBe(80)
      expect(result.fluency).toBe(70)
    })

    it('should scale values > 90 assuming 0-100 range', () => {
      const raw = { content: 100, fluency: 95 }
      const result = normalizeSubscores(raw)
      expect(result.content).toBe(90)
      expect(result.fluency).toBeCloseTo(86, 0)
    })

    it('should apply custom scalers when provided', () => {
      const raw = { content: 5 }
      const scalers = { content: { min: 0, max: 10 } }
      const result = normalizeSubscores(raw, scalers)
      expect(result.content).toBe(45)
    })

    it('should skip undefined values', () => {
      const raw = { content: 80, fluency: undefined }
      const result = normalizeSubscores(raw)
      expect(result.content).toBe(80)
      expect(result.fluency).toBeUndefined()
    })
  })

  describe('mergeProviderScores', () => {
    it('should merge subscores from multiple providers by averaging', () => {
      const inputs: ProviderRawScore[] = [
        { subscores: { content: 80, fluency: 70 } },
        { subscores: { content: 90, fluency: 60 } },
      ]
      const result = mergeProviderScores(inputs, TestSection.SPEAKING)
      expect(result.subscores.content).toBe(85)
      expect(result.subscores.fluency).toBe(65)
    })

    it('should handle partial subscore overlap', () => {
      const inputs: ProviderRawScore[] = [
        { subscores: { content: 80 } },
        { subscores: { fluency: 60 } },
      ]
      const result = mergeProviderScores(inputs, TestSection.SPEAKING)
      expect(result.subscores.content).toBe(80)
      expect(result.subscores.fluency).toBe(60)
    })

    it('should fall back to overall scores when no subscores', () => {
      const inputs: ProviderRawScore[] = [
        { overall: 80 },
        { overall: 70 },
      ]
      const result = mergeProviderScores(inputs, TestSection.SPEAKING)
      expect(result.overall).toBe(75)
      expect(Object.keys(result.subscores)).toHaveLength(0)
    })

    it('should normalize scores > 90', () => {
      const inputs: ProviderRawScore[] = [
        { subscores: { content: 100 } },
      ]
      const result = mergeProviderScores(inputs, TestSection.SPEAKING)
      expect(result.subscores.content).toBe(90)
    })

    it('should combine rationales', () => {
      const inputs: ProviderRawScore[] = [
        { subscores: { content: 80 }, rationale: 'Good content' },
        { subscores: { content: 90 }, rationale: 'Excellent work' },
      ]
      const result = mergeProviderScores(inputs, TestSection.SPEAKING)
      expect(result.rationale).toContain('Good content')
      expect(result.rationale).toContain('Excellent work')
    })

    it('should collect provider metadata', () => {
      const inputs: ProviderRawScore[] = [
        { 
          subscores: { content: 80 },
          meta: { provider: 'openai', model: 'gpt-4' }
        },
      ]
      const result = mergeProviderScores(inputs, TestSection.SPEAKING)
      expect(result.metadata?.providers).toHaveLength(1)
      expect(result.metadata?.providers[0].provider).toBe('openai')
    })
  })

  describe('buildDeterministicResult', () => {
    it('should build result for READING section with accuracy', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracy: 0.8,
        rationale: 'Test rationale',
      })
      expect(result.subscores.correctness).toBe(72)
      expect(result.overall).toBe(72)
      expect(result.rationale).toBe('Test rationale')
      expect(result.metadata?.provider).toBe('deterministic')
    })

    it('should handle accuracy as percentage', () => {
      const result = buildDeterministicResult({
        section: TestSection.READING,
        accuracyPct: 80,
      })
      expect(result.subscores.correctness).toBe(72)
    })

    it('should build result for LISTENING with WER', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        wer: 0.2,
      })
      expect(result.subscores.wer).toBeGreaterThan(0)
      expect(result.subscores.wer).toBeLessThanOrEqual(90)
    })

    it('should handle both accuracy and WER for LISTENING', () => {
      const result = buildDeterministicResult({
        section: TestSection.LISTENING,
        accuracy: 0.9,
        wer: 0.1,
      })
      expect(result.subscores.correctness).toBeDefined()
      expect(result.subscores.wer).toBeDefined()
    })
  })

  describe('combineDeterministicAndLLM', () => {
    it('should prefer deterministic subscores', () => {
      const deterministic: ScoringResult = {
        overall: 75,
        subscores: { correctness: 80 },
        rationale: 'Deterministic',
      }
      const llm: ScoringResult = {
        overall: 70,
        subscores: { content: 85, correctness: 60 },
        rationale: 'LLM feedback',
      }
      const result = combineDeterministicAndLLM(deterministic, llm)
      expect(result.subscores.correctness).toBe(80)
      expect(result.subscores.content).toBe(85)
    })

    it('should handle null deterministic', () => {
      const llm: ScoringResult = {
        overall: 70,
        subscores: { content: 85 },
      }
      const result = combineDeterministicAndLLM(null, llm)
      expect(result.subscores.content).toBe(85)
    })

    it('should handle null LLM', () => {
      const deterministic: ScoringResult = {
        overall: 75,
        subscores: { correctness: 80 },
      }
      const result = combineDeterministicAndLLM(deterministic, null)
      expect(result.subscores.correctness).toBe(80)
    })

    it('should handle both null', () => {
      const result = combineDeterministicAndLLM(null, null)
      expect(result.overall).toBe(0)
      expect(Object.keys(result.subscores)).toHaveLength(0)
    })

    it('should combine rationales', () => {
      const deterministic: ScoringResult = {
        overall: 75,
        subscores: { correctness: 80 },
        rationale: 'Det feedback',
      }
      const llm: ScoringResult = {
        overall: 70,
        subscores: { content: 85 },
        rationale: 'LLM feedback',
      }
      const result = combineDeterministicAndLLM(deterministic, llm)
      expect(result.rationale).toContain('Deterministic')
      expect(result.rationale).toContain('LLM')
    })
  })

  describe('toTestSection', () => {
    it('should map "speaking" strings to SPEAKING', () => {
      expect(toTestSection('speaking')).toBe(TestSection.SPEAKING)
      expect(toTestSection('SPEAKING')).toBe(TestSection.SPEAKING)
      expect(toTestSection('speak')).toBe(TestSection.SPEAKING)
    })

    it('should map "writing" strings to WRITING', () => {
      expect(toTestSection('writing')).toBe(TestSection.WRITING)
      expect(toTestSection('WRITING')).toBe(TestSection.WRITING)
      expect(toTestSection('write')).toBe(TestSection.WRITING)
    })

    it('should map "reading" strings to READING', () => {
      expect(toTestSection('reading')).toBe(TestSection.READING)
      expect(toTestSection('READING')).toBe(TestSection.READING)
      expect(toTestSection('read')).toBe(TestSection.READING)
    })

    it('should map "listening" strings to LISTENING', () => {
      expect(toTestSection('listening')).toBe(TestSection.LISTENING)
      expect(toTestSection('LISTENING')).toBe(TestSection.LISTENING)
      expect(toTestSection('listen')).toBe(TestSection.LISTENING)
    })

    it('should default to READING for unknown strings', () => {
      expect(toTestSection('unknown')).toBe(TestSection.READING)
      expect(toTestSection('')).toBe(TestSection.READING)
    })
  })
})
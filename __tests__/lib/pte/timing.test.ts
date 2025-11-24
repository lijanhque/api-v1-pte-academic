/**
 * Unit tests for lib/pte/timing.ts
 * Tests PTE timing utilities and conversions
 */

import { ms, format, endAtFrom, driftMs, timingFor, formatLabel } from '@/lib/pte/timing'

describe('timing', () => {
  describe('ms helpers', () => {
    it('should convert seconds to milliseconds', () => {
      expect(ms.s(1)).toBe(1000)
      expect(ms.s(30)).toBe(30000)
      expect(ms.s(0)).toBe(0)
    })

    it('should convert minutes to milliseconds', () => {
      expect(ms.m(1)).toBe(60000)
      expect(ms.m(10)).toBe(600000)
      expect(ms.m(0)).toBe(0)
    })
  })

  describe('format', () => {
    it('should format milliseconds as mm:ss', () => {
      expect(format(0)).toBe('00:00')
      expect(format(1000)).toBe('00:01')
      expect(format(60000)).toBe('01:00')
      expect(format(90000)).toBe('01:30')
    })

    it('should format as hh:mm:ss when >= 1 hour', () => {
      expect(format(3600000)).toBe('01:00:00')
      expect(format(3661000)).toBe('01:01:01')
      expect(format(7200000)).toBe('02:00:00')
    })

    it('should handle negative values as zero', () => {
      expect(format(-1000)).toBe('00:00')
    })

    it('should pad single digits with zero', () => {
      expect(format(5000)).toBe('00:05')
      expect(format(305000)).toBe('05:05')
    })
  })

  describe('endAtFrom', () => {
    it('should calculate end time from start and duration', () => {
      const start = 1000000
      const duration = 30000
      expect(endAtFrom(start, duration)).toBe(1030000)
    })

    it('should handle zero duration', () => {
      const start = 1000000
      expect(endAtFrom(start, 0)).toBe(1000000)
    })

    it('should handle negative duration as zero', () => {
      const start = 1000000
      expect(endAtFrom(start, -5000)).toBe(1000000)
    })
  })

  describe('driftMs', () => {
    it('should calculate drift between server and client time', () => {
      expect(driftMs(1000, 1100)).toBe(100)
      expect(driftMs(1000, 900)).toBe(-100)
      expect(driftMs(1000, 1000)).toBe(0)
    })

    it('should handle large differences', () => {
      expect(driftMs(0, 1000000)).toBe(1000000)
    })
  })

  describe('timingFor', () => {
    describe('speaking section', () => {
      it('should return timing for read_aloud', () => {
        const result = timingFor('speaking', 'read_aloud')
        expect(result.section).toBe('speaking')
        expect(result.type).toBe('read_aloud')
        expect(result.prepMs).toBeDefined()
        expect(result.answerMs).toBeDefined()
      })

      it('should return timing for repeat_sentence', () => {
        const result = timingFor('speaking', 'repeat_sentence')
        expect(result.section).toBe('speaking')
        expect(result.prepMs).toBeDefined()
        expect(result.answerMs).toBeDefined()
      })

      it('should fallback to read_aloud for unknown type', () => {
        const result = timingFor('speaking', 'unknown_type')
        expect(result.section).toBe('speaking')
        expect(result.prepMs).toBeDefined()
        expect(result.answerMs).toBeDefined()
      })
    })

    describe('writing section', () => {
      it('should return timing for write_essay', () => {
        const result = timingFor('writing', 'write_essay')
        expect(result.section).toBe('writing')
        expect(result.type).toBe('write_essay')
        expect(result.answerMs).toBeDefined()
        expect(result.answerMs).toBeGreaterThan(0)
      })

      it('should return timing for summarize_written_text', () => {
        const result = timingFor('writing', 'summarize_written_text')
        expect(result.section).toBe('writing')
        expect(result.answerMs).toBeDefined()
      })
    })

    describe('reading section', () => {
      it('should return section timing', () => {
        const result = timingFor('reading')
        expect(result.section).toBe('reading')
        expect('sectionMs' in result).toBe(true)
        expect(result.sectionMs).toBeGreaterThan(0)
      })

      it('should accept type parameter but return section timing', () => {
        const result = timingFor('reading', 'multiple_choice_single')
        expect(result.section).toBe('reading')
        expect('sectionMs' in result).toBe(true)
      })
    })

    describe('listening section', () => {
      it('should return item timing for summarize_spoken_text', () => {
        const result = timingFor('listening', 'summarize_spoken_text')
        expect(result.section).toBe('listening')
        expect('answerMs' in result).toBe(true)
        expect(result.answerMs).toBeGreaterThan(0)
      })

      it('should return section timing for other types', () => {
        const result = timingFor('listening', 'write_from_dictation')
        expect(result.section).toBe('listening')
        expect('sectionMs' in result).toBe(true)
      })

      it('should return section timing when no type specified', () => {
        const result = timingFor('listening')
        expect(result.section).toBe('listening')
        expect('sectionMs' in result).toBe(true)
      })
    })
  })

  describe('formatLabel', () => {
    it('should format speaking labels', () => {
      expect(formatLabel('speaking', 'read_aloud')).toBe('Speaking · read aloud')
      expect(formatLabel('speaking', 'repeat_sentence')).toBe('Speaking · repeat sentence')
    })

    it('should format writing labels', () => {
      expect(formatLabel('writing', 'write_essay')).toBe('Writing · write essay')
    })

    it('should format reading labels', () => {
      expect(formatLabel('reading')).toBe('Reading Section')
      expect(formatLabel('reading', 'multiple_choice')).toBe('Reading Section')
    })

    it('should format listening labels', () => {
      expect(formatLabel('listening')).toBe('Listening Section')
      expect(formatLabel('listening', 'summarize_spoken_text')).toBe('Listening · Summarize Spoken Text')
      expect(formatLabel('listening', 'other_type')).toBe('Listening Section')
    })

    it('should handle unknown sections', () => {
      expect(formatLabel('unknown' as any)).toBe('PTE')
    })
  })
})
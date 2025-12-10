import { z } from 'zod'

// Writing types aligned with DB and docs
const WRITING_TYPES = ['summarize_written_text', 'write_essay'] as const

export const WritingQuestionTypeSchema = z.enum(WRITING_TYPES)
export type WritingQuestionType = z.infer<typeof WritingQuestionTypeSchema>

export const DifficultyFilterSchema = z
  .enum(['All', 'Easy', 'Medium', 'Hard'])
  .default('All')

export const WritingListQuerySchema = z.object({
  type: WritingQuestionTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default(''),
  difficulty: DifficultyFilterSchema,
  isActive: z.coerce.boolean().default(true),
  sortBy: z.enum(['difficulty', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type WritingListQuery = z.infer<typeof WritingListQuerySchema>

export const WritingIdParamsSchema = z.object({
  id: z.string().min(1),
})
export type WritingIdParams = z.infer<typeof WritingIdParamsSchema>

// Attempt body: using timeTaken seconds (consistent with reading attempts + DB columns)
export const WritingAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: WritingQuestionTypeSchema,
  textAnswer: z.string().min(1).max(10000), // allow long essays, still bounded
  timeTaken: z.coerce.number().int().positive().max(7200).optional(), // up to 2h
  timings: z.record(z.string(), z.any()).optional(),
})

export type WritingAttemptBody = z.infer<typeof WritingAttemptBodySchema>

export function parseListQuery(url: URL): WritingListQuery {
  const raw = Object.fromEntries(url.searchParams.entries())
  const result = WritingListQuerySchema.safeParse(raw)
  if (!result.success) {
    throw new Error(result.error.issues.map((i) => i.message).join('; '))
  }
  return result.data
}

export function normalizeDifficulty(
  d: string | undefined
): 'All' | 'Easy' | 'Medium' | 'Hard' {
  if (!d) return 'All'
  const v = d.toLowerCase()
  if (v === 'all') return 'All'
  if (v === 'easy') return 'Easy'
  if (v === 'medium') return 'Medium'
  if (v === 'hard') return 'Hard'
  return 'All'
}

// Helpers for word/char counting & basic validations (can be reused server-side)
export function countWords(text: string): number {
  if (!text) return 0
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  return words.length
}

export function basicLengthValidation(type: WritingQuestionType, text: string) {
  const wc = countWords(text)
  if (type === 'summarize_written_text') {
    // Typical PTE range is ~ 5 to 75 words (one-sentence summary)
    return {
      wordCount: wc,
      min: 5,
      max: 75,
      withinRange: wc >= 5 && wc <= 75,
    }
  }
  // write_essay
  // Common practice: 200-300 words; allow broader range for practice
  return {
    wordCount: wc,
    min: 150,
    max: 450,
    withinRange: wc >= 150 && wc <= 450,
  }
}

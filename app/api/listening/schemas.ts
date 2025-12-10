import { z } from 'zod'

const LISTENING_TYPES = [
  'summarize_spoken_text',
  'multiple_choice_single',
  'multiple_choice_multiple',
  'fill_in_blanks',
  'highlight_correct_summary',
  'select_missing_word',
  'highlight_incorrect_words',
  'write_from_dictation',
] as const

export const ListeningQuestionTypeSchema = z.enum(LISTENING_TYPES)

export type ListeningQuestionType = z.infer<typeof ListeningQuestionTypeSchema>

export const DifficultyFilterSchema = z
  .enum(['All', 'Easy', 'Medium', 'Hard'])
  .default('All')

export const ListeningListQuerySchema = z.object({
  type: ListeningQuestionTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default(''),
  difficulty: DifficultyFilterSchema,
  isActive: z.coerce.boolean().default(true),
  sortBy: z.enum(['difficulty', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ListeningListQuery = z.infer<typeof ListeningListQuerySchema>

export const ListeningIdParamsSchema = z.object({
  id: z.string().min(1),
})

export type ListeningIdParams = z.infer<typeof ListeningIdParamsSchema>

// Response schemas for different question types
export const SummarizeSpokenTextResponseSchema = z.object({
  textAnswer: z.string().min(1).max(2000),
})

export const WriteFromDictationResponseSchema = z.object({
  textAnswer: z.string().min(1).max(500),
})

export const MultipleChoiceSingleResponseSchema = z.object({
  selectedOption: z.string().min(1),
})

export const MultipleChoiceMultipleResponseSchema = z.object({
  selectedOptions: z.array(z.string()).min(1),
})

export const FillInBlanksResponseSchema = z.object({
  answers: z.record(z.string(), z.string()), // key: blank index, value: answer
})

export const HighlightCorrectSummaryResponseSchema = z.object({
  selectedOption: z.string().min(1),
})

export const SelectMissingWordResponseSchema = z.object({
  selectedOption: z.string().min(1),
})

export const HighlightIncorrectWordsResponseSchema = z.object({
  indices: z.array(z.number().int().min(0)),
})

// Union of all possible response types
export const ListeningAttemptResponseSchema = z.union([
  SummarizeSpokenTextResponseSchema,
  WriteFromDictationResponseSchema,
  MultipleChoiceSingleResponseSchema,
  MultipleChoiceMultipleResponseSchema,
  FillInBlanksResponseSchema,
  HighlightCorrectSummaryResponseSchema,
  SelectMissingWordResponseSchema,
  HighlightIncorrectWordsResponseSchema,
])

export const ListeningAttemptBodySchema = z.object({
  questionId: z.string().min(1),
  type: ListeningQuestionTypeSchema,
  userResponse: ListeningAttemptResponseSchema,
  timeTaken: z.coerce.number().int().positive().max(3600).optional(), // max 1 hour
  timings: z.record(z.string(), z.any()).optional(),
})

export type ListeningAttemptBody = z.infer<typeof ListeningAttemptBodySchema>

export function parseListQuery(url: URL): ListeningListQuery {
  const raw = Object.fromEntries(url.searchParams.entries())
  const result = ListeningListQuerySchema.safeParse(raw)
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

// Helper function to count words for text responses
export function countWords(text: string): number {
  if (!text) return 0
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  return words.length
}

// Validation for text-based listening responses
export function textLengthValidation(
  type: ListeningQuestionType,
  text: string
) {
  const wc = countWords(text)

  if (type === 'summarize_spoken_text') {
    // Typical PTE range: 50-70 words
    return {
      wordCount: wc,
      min: 50,
      max: 70,
      withinRange: wc >= 50 && wc <= 70,
    }
  }

  if (type === 'write_from_dictation') {
    // Should match the dictated sentence length
    return {
      wordCount: wc,
      min: 1,
      max: 100,
      withinRange: wc >= 1 && wc <= 100,
    }
  }

  return {
    wordCount: wc,
    min: 0,
    max: Infinity,
    withinRange: true,
  }
}

import 'server-only'
import { generateAIFeedback } from '@/lib/pte/ai-feedback'
import {
  QuestionType,
  TestSection,
  type SpeakingScore,
  type SpeakingType,
} from '@/lib/pte/types'

/**
 * Score a speaking attempt using available adapters.
 * Uses official PTE Academic 0-5 scoring scale for Content, Pronunciation, and Fluency.
 * Prefers AI feedback when available; otherwise falls back to simple heuristics.
 */
export async function scoreAttempt(params: {
  type: SpeakingType
  question: any
  transcript: string
  audioUrl: string
  durationMs: number
}): Promise<
  SpeakingScore & { feedback?: any; meta?: Record<string, unknown> }
> {
  const { type, transcript = '', durationMs } = params

  const words = tokenizeWords(transcript)
  const wordCount = words.length
  const minutes = Math.max(durationMs / 60000, 0.001)
  const wordsPerMinute = Number((wordCount / minutes).toFixed(2))
  const fillerRate = Number(computeFillerRate(words).toFixed(3))

  const meta: Record<string, unknown> = {
    words: wordCount,
    wordsPerMinute,
    fillerRate,
  }

  // Try AI feedback (uses OpenAI if configured; otherwise mocked)
  try {
    const qType = mapSpeakingToQuestionType(type)
    const ai = await generateAIFeedback(qType, TestSection.SPEAKING, transcript)
    meta.ai = { provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock' }

    // Map AI feedback to official PTE 0-5 scale
    // AI returns 0-90, so we need to convert to 0-5
    const pronunciation = clamp0to5(
      convertTo5Scale(ai.pronunciation?.score ?? roughPronunciation(wordsPerMinute, fillerRate))
    )
    const fluency = clamp0to5(
      convertTo5Scale(ai.fluency?.score ?? roughFluency(wordsPerMinute, fillerRate))
    )
    const content = clamp0to5(
      convertTo5Scale(ai.content?.score ?? roughContent(wordCount, durationMs, type))
    )

    // Calculate total score (aggregate enabling skills score 0-90)
    // Based on PTE Academic scoring: each criteria contributes proportionally
    const total = calculateTotalScore(content, pronunciation, fluency)

    const rubric = {
      contentNotes: ai.content?.feedback,
      fluencyNotes: ai.fluency?.feedback,
      pronunciationNotes: ai.pronunciation?.feedback,
      details: {
        suggestions: ai.suggestions,
        strengths: ai.strengths,
        areasForImprovement: ai.areasForImprovement,
      },
    }

    return {
      content,
      pronunciation,
      fluency,
      total,
      rubric,
      feedback: ai,
      meta,
    }
  } catch (err) {
    // Fall back to heuristics
    meta.aiError = err instanceof Error ? err.message : 'ai_feedback_failed'

    const pronunciation = clamp0to5(
      convertTo5Scale(roughPronunciation(wordsPerMinute, fillerRate))
    )
    const fluency = clamp0to5(
      convertTo5Scale(roughFluency(wordsPerMinute, fillerRate))
    )
    const content = clamp0to5(
      convertTo5Scale(roughContent(wordCount, durationMs, type))
    )
    const total = calculateTotalScore(content, pronunciation, fluency)

    return {
      content,
      pronunciation,
      fluency,
      total,
      rubric: {
        details: { note: 'Heuristic scoring (AI unavailable).' },
      },
      meta,
    }
  }
}

/** Helpers **/

function mapSpeakingToQuestionType(t: SpeakingType): QuestionType {
  switch (t) {
    case 'read_aloud':
      return QuestionType.READ_ALOUD
    case 'repeat_sentence':
      return QuestionType.REPEAT_SENTENCE
    case 'describe_image':
      return QuestionType.DESCRIBE_IMAGE
    case 'retell_lecture':
      return QuestionType.RE_TELL_LECTURE
    case 'answer_short_question':
      return QuestionType.ANSWER_SHORT_QUESTION
    // Not present in QuestionType enum; map to closest for feedback prompts
    case 'summarize_group_discussion':
      return QuestionType.RE_TELL_LECTURE
    case 'respond_to_a_situation':
      return QuestionType.REPEAT_SENTENCE
    default:
      return QuestionType.READ_ALOUD
  }
}

function tokenizeWords(text: string): string[] {
  if (!text) return []
  // Normalize and split on non-letter sequences
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\u00C0-\u024F']+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

const FILLERS = new Set([
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you',
  'know',
  'sort',
  'of',
  'kind',
  'kinda',
  'sorta',
  'hmm',
  'mmm',
  'uhh',
  'umm',
])

function computeFillerRate(words: string[]): number {
  const wc = words.length || 1
  let fillerCount = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (FILLERS.has(w)) fillerCount++
    // treat "you know" as a filler phrase
    if (w === 'you' && words[i + 1] === 'know') fillerCount++
    if (w === 'sort' && words[i + 1] === 'of') fillerCount++
    if (w === 'kind' && words[i + 1] === 'of') fillerCount++
  }
  return fillerCount / wc
}

function roughPronunciation(wpm: number, fillerRate: number): number {
  // Favor moderate WPM and low fillers
  let score = 70
  if (wpm < 70) score -= 10
  if (wpm > 170) score -= 10
  score -= Math.min(20, Math.round(fillerRate * 100))
  return score
}

function roughFluency(wpm: number, fillerRate: number): number {
  let score = 72
  if (wpm < 80) score -= 12
  if (wpm > 180) score -= 8
  score -= Math.min(25, Math.round(fillerRate * 120))
  return score
}

function roughContent(wordCount: number, durationMs: number, type: SpeakingType): number {
  const minutes = Math.max(durationMs / 60000, 0.001)
  const density = wordCount / minutes

  // For describe_image, content is based on elements described
  // Heuristic: more words generally means more elements described
  if (type === 'describe_image') {
    // Target: 12+ key items described for full score
    // Rough estimate: ~3-5 words per item = 36-60 words minimum
    if (wordCount === 0 || durationMs < 500) return 20
    if (wordCount >= 60 && density >= 90 && density <= 160) return 85 // Likely 12+ items
    if (wordCount >= 45 && density >= 80) return 75 // Likely 9-11 items
    if (wordCount >= 30) return 65 // Likely 6-8 items
    if (wordCount >= 20) return 55 // Likely 4-5 items
    return 40
  }

  // General heuristic for other speaking types
  if (wordCount === 0 || durationMs < 500) return 20
  let score = 68
  if (density < 80) score -= 12
  if (density > 190) score -= 10
  return score
}

/**
 * Convert 0-90 scale to official PTE Academic 0-5 scale
 * 0-90 maps to 0-5 where:
 * 81-90 = 5 (native-like)
 * 61-80 = 4 (very good)
 * 41-60 = 3 (good)
 * 21-40 = 2 (limited)
 * 1-20 = 1 (very limited)
 * 0 = 0 (no attempt/unintelligible)
 */
function convertTo5Scale(score90: number): number {
  if (score90 >= 81) return 5
  if (score90 >= 61) return 4
  if (score90 >= 41) return 3
  if (score90 >= 21) return 2
  if (score90 >= 1) return 1
  return 0
}

/**
 * Calculate total score from 0-5 criteria scores
 * Converts back to 0-90 scale for overall enabling skills score
 * Uses PTE Academic weightings: Content 40%, Pronunciation 30%, Fluency 30%
 */
function calculateTotalScore(content: number, pronunciation: number, fluency: number): number {
  // Convert 0-5 scores to 0-90 equivalent for calculation
  const contentScore = (content / 5) * 90
  const pronunciationScore = (pronunciation / 5) * 90
  const fluencyScore = (fluency / 5) * 90

  // Apply PTE weightings
  const weighted = (contentScore * 0.4) + (pronunciationScore * 0.3) + (fluencyScore * 0.3)

  return Math.round(Math.max(0, Math.min(90, weighted)))
}

function clamp0to90(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(90, Math.round(n)))
}

function clamp0to5(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, Math.round(n)))
}

import 'server-only'
import { TestSection } from '@/lib/pte/types'

export interface OrchestratorPayload {
  question?: string
  options?: any
  correct?: any
  userSelected?: any[]
  transcript?: string
  audioUrl?: string
}

export interface OrchestratorInput {
  section: TestSection
  questionType: string
  payload: OrchestratorPayload
  includeRationale?: boolean
  timeoutMs?: number
}

export interface OrchestratorResult {
  score: number
  rationale?: string
  feedback?: string
  breakdown?: Record<string, number>
}

export async function scoreWithOrchestrator(
  input: OrchestratorInput
): Promise<OrchestratorResult> {
  const { section, questionType, payload, includeRationale } = input

  // Base scoring logic - in production this would call AI models
  let score = 0
  let rationale: string | undefined

  try {
    switch (section) {
      case TestSection.READING:
        score = calculateReadingScore(payload)
        if (includeRationale) {
          rationale = generateReadingRationale(payload, score)
        }
        break

      case TestSection.SPEAKING:
        score = calculateSpeakingScore(payload)
        if (includeRationale) {
          rationale = generateSpeakingRationale(payload, score)
        }
        break

      case TestSection.WRITING:
        score = calculateWritingScore(payload)
        if (includeRationale) {
          rationale = generateWritingRationale(payload, score)
        }
        break

      case TestSection.LISTENING:
        score = calculateListeningScore(payload)
        if (includeRationale) {
          rationale = generateListeningRationale(payload, score)
        }
        break

      default:
        score = 50
    }
  } catch (error) {
    console.error('[orchestrator] scoring error:', error)
    score = 0
  }

  return {
    score,
    rationale,
    feedback: rationale,
  }
}

function calculateReadingScore(payload: OrchestratorPayload): number {
  const { correct, userSelected } = payload
  if (!correct || !userSelected) return 0

  if (Array.isArray(correct) && Array.isArray(userSelected)) {
    const correctSet = new Set(correct)
    let correctCount = 0
    for (const answer of userSelected) {
      if (correctSet.has(answer)) correctCount++
    }
    return Math.round((correctCount / correct.length) * 100)
  }

  return correct === userSelected?.[0] ? 100 : 0
}

function calculateSpeakingScore(payload: OrchestratorPayload): number {
  const { transcript } = payload
  if (!transcript) return 0

  const wordCount = transcript.split(/\s+/).filter(Boolean).length
  if (wordCount < 10) return 30
  if (wordCount < 30) return 50
  if (wordCount < 60) return 70
  return 85
}

function calculateWritingScore(payload: OrchestratorPayload): number {
  return 70 // Placeholder - would use AI in production
}

function calculateListeningScore(payload: OrchestratorPayload): number {
  return calculateReadingScore(payload) // Similar scoring logic
}

function generateReadingRationale(
  payload: OrchestratorPayload,
  score: number
): string {
  if (score >= 80) return 'Excellent comprehension demonstrated.'
  if (score >= 60) return 'Good understanding with minor errors.'
  if (score >= 40) return 'Partial understanding - review key concepts.'
  return 'Review the passage carefully and practice inference skills.'
}

function generateSpeakingRationale(
  payload: OrchestratorPayload,
  score: number
): string {
  if (score >= 80) return 'Clear and fluent delivery with good pronunciation.'
  if (score >= 60) return 'Good delivery with some hesitations.'
  if (score >= 40) return 'Consider improving pace and clarity.'
  return 'Practice speaking more clearly and at a steady pace.'
}

function generateWritingRationale(
  payload: OrchestratorPayload,
  score: number
): string {
  if (score >= 80) return 'Well-structured response with good vocabulary.'
  if (score >= 60) return 'Good structure with minor grammatical issues.'
  return 'Focus on organization and grammar.'
}

function generateListeningRationale(
  payload: OrchestratorPayload,
  score: number
): string {
  if (score >= 80) return 'Excellent listening comprehension.'
  if (score >= 60) return 'Good comprehension with some missed details.'
  return 'Practice active listening and note-taking.'
}

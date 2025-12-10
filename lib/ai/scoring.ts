import 'server-only'

export interface ReadAloudScore {
  content: number
  pronunciation: number
  fluency: number
  total: number
  feedback: string
  meta?: {
    wordsPerMinute?: number
    fillerRate?: number
    pauseCount?: number
  }
}

export async function scoreReadAloud(
  promptText: string,
  transcript: string,
  durationMs: number
): Promise<ReadAloudScore> {
  if (!transcript || transcript.trim().length === 0) {
    return {
      content: 0,
      pronunciation: 0,
      fluency: 0,
      total: 0,
      feedback: 'No speech detected. Please try again.',
      meta: { wordsPerMinute: 0, fillerRate: 0, pauseCount: 0 },
    }
  }

  const promptWords = promptText.toLowerCase().split(/\s+/).filter(Boolean)
  const transcriptWords = transcript.toLowerCase().split(/\s+/).filter(Boolean)

  // Calculate content score based on word matching
  const matchedWords = transcriptWords.filter((word) =>
    promptWords.includes(word)
  )
  const contentScore = Math.min(
    90,
    Math.round((matchedWords.length / promptWords.length) * 90)
  )

  // Calculate fluency based on duration and word count
  const durationMinutes = durationMs / 60000
  const wordsPerMinute = durationMinutes > 0 ? transcriptWords.length / durationMinutes : 0

  let fluencyScore = 50
  if (wordsPerMinute >= 120 && wordsPerMinute <= 160) {
    fluencyScore = 90
  } else if (wordsPerMinute >= 100 && wordsPerMinute <= 180) {
    fluencyScore = 75
  } else if (wordsPerMinute >= 80) {
    fluencyScore = 60
  }

  // Estimate pronunciation (in production, this would use AI/speech analysis)
  const pronunciationScore = Math.min(90, Math.round((contentScore + fluencyScore) / 2))

  // Calculate total score
  const total = Math.round((contentScore + pronunciationScore + fluencyScore) / 3)

  // Generate feedback
  let feedback = ''
  if (total >= 80) {
    feedback = 'Excellent performance! Clear pronunciation and good pacing.'
  } else if (total >= 60) {
    feedback = 'Good attempt. Focus on maintaining a steady pace and pronouncing all words clearly.'
  } else if (total >= 40) {
    feedback = 'Practice reading aloud more often. Pay attention to word stress and intonation.'
  } else {
    feedback = 'Please ensure you read the entire passage clearly. Practice with simpler texts first.'
  }

  return {
    content: contentScore,
    pronunciation: pronunciationScore,
    fluency: fluencyScore,
    total,
    feedback,
    meta: {
      wordsPerMinute: Math.round(wordsPerMinute),
      fillerRate: 0,
      pauseCount: 0,
    },
  }
}

export interface RepeatSentenceScore {
  content: number
  pronunciation: number
  fluency: number
  total: number
  feedback: string
}

export async function scoreRepeatSentence(
  originalSentence: string,
  transcript: string,
  durationMs: number
): Promise<RepeatSentenceScore> {
  return scoreReadAloud(originalSentence, transcript, durationMs)
}

export interface DescribeImageScore {
  content: number
  pronunciation: number
  fluency: number
  vocabulary: number
  total: number
  feedback: string
}

export async function scoreDescribeImage(
  imageDescription: string,
  transcript: string,
  durationMs: number
): Promise<DescribeImageScore> {
  const baseScore = await scoreReadAloud(imageDescription, transcript, durationMs)

  // Add vocabulary assessment
  const uniqueWords = new Set(transcript.toLowerCase().split(/\s+/).filter(Boolean))
  const vocabularyScore = Math.min(90, uniqueWords.size * 3)

  return {
    ...baseScore,
    vocabulary: vocabularyScore,
    total: Math.round((baseScore.total * 3 + vocabularyScore) / 4),
  }
}

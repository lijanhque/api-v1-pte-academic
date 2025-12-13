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

// ============== WRITING SCORING ==============

export interface WritingScore {
  content: number      // 0-90: Topic relevance and task completion
  grammar: number      // 0-90: Grammatical accuracy
  vocabulary: number   // 0-90: Lexical resource and word choice
  coherence: number    // 0-90: Logical flow and organization
  total: number        // 0-90: Overall score
  feedback: string
  meta?: {
    wordCount: number
    sentenceCount: number
    uniqueWordRatio: number
    avgSentenceLength: number
  }
}

// Common grammar error patterns
const GRAMMAR_ERROR_PATTERNS = [
  /\s{2,}/g,                           // Multiple spaces
  /[.!?]\s*[a-z]/g,                    // Lowercase after sentence end
  /\bi\b(?!['])/gi,                    // Lowercase "i" (not "i'm", "i'll")
  /\s[,.:;!?]/g,                       // Space before punctuation
  /[^.!?]\s*$/,                        // Missing ending punctuation
  /\b(a)\s+[aeiou]/gi,                 // "a" before vowel (should be "an")
  /\b(an)\s+[^aeiou\s]/gi,             // "an" before consonant
  /\bdont\b/gi,                        // Missing apostrophe
  /\bwont\b/gi,
  /\bcant\b/gi,
  /\bisnt\b/gi,
  /\barent\b/gi,
  /\bwasnt\b/gi,
  /\bwerent\b/gi,
  /\bhasnt\b/gi,
  /\bhavent\b/gi,
  /\bdoesnt\b/gi,
  /\bcouldnt\b/gi,
  /\bwouldnt\b/gi,
  /\bshouldnt\b/gi,
]

// Academic/formal vocabulary indicators
const ACADEMIC_WORDS = new Set([
  'however', 'therefore', 'furthermore', 'moreover', 'consequently',
  'nevertheless', 'although', 'whereas', 'despite', 'regarding',
  'significant', 'essential', 'fundamental', 'substantial', 'considerable',
  'analysis', 'approach', 'concept', 'context', 'data', 'evidence',
  'factors', 'function', 'impact', 'implications', 'indicate', 'issue',
  'method', 'occur', 'percent', 'period', 'policy', 'principle',
  'process', 'research', 'response', 'role', 'section', 'sector',
  'specific', 'structure', 'theory', 'variable', 'demonstrate',
  'establish', 'obtain', 'maintain', 'achieve', 'assess', 'assume',
])

// Transition words for coherence
const TRANSITION_WORDS = new Set([
  'firstly', 'secondly', 'thirdly', 'finally', 'lastly',
  'in addition', 'additionally', 'moreover', 'furthermore',
  'however', 'nevertheless', 'on the other hand', 'in contrast',
  'therefore', 'thus', 'consequently', 'as a result', 'hence',
  'for example', 'for instance', 'such as', 'specifically',
  'in conclusion', 'to summarize', 'in summary', 'overall',
  'meanwhile', 'subsequently', 'previously', 'initially',
])

function countGrammarErrors(text: string): number {
  let errorCount = 0
  for (const pattern of GRAMMAR_ERROR_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) errorCount += matches.length
  }
  return errorCount
}

function countAcademicWords(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  return words.filter(w => ACADEMIC_WORDS.has(w)).length
}

function countTransitionWords(text: string): number {
  const lowerText = text.toLowerCase()
  let count = 0
  for (const tw of TRANSITION_WORDS) {
    if (lowerText.includes(tw)) count++
  }
  return count
}

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function getWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\u00C0-\u024F'\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0)
}

export async function scoreWriting(
  text: string,
  type: 'summarize_written_text' | 'write_essay',
  promptText?: string
): Promise<WritingScore> {
  const trimmedText = (text || '').trim()

  if (!trimmedText || trimmedText.length < 10) {
    return {
      content: 0,
      grammar: 0,
      vocabulary: 0,
      coherence: 0,
      total: 0,
      feedback: 'Response too short. Please provide a more detailed answer.',
      meta: { wordCount: 0, sentenceCount: 0, uniqueWordRatio: 0, avgSentenceLength: 0 }
    }
  }

  const words = getWords(trimmedText)
  const sentences = getSentences(trimmedText)
  const wordCount = words.length
  const sentenceCount = sentences.length
  const uniqueWords = new Set(words)
  const uniqueWordRatio = uniqueWords.size / Math.max(1, wordCount)
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0

  // Length requirements
  const lengthReq = type === 'summarize_written_text'
    ? { min: 5, max: 75, optimal: { min: 30, max: 60 } }
    : { min: 200, max: 300, optimal: { min: 250, max: 280 } }

  // === CONTENT SCORE (0-90) ===
  let contentScore = 70 // baseline

  // Length check
  if (wordCount < lengthReq.min) {
    contentScore -= 30
  } else if (wordCount > lengthReq.max * 1.5) {
    contentScore -= 20
  } else if (wordCount >= lengthReq.optimal.min && wordCount <= lengthReq.optimal.max) {
    contentScore += 15
  } else if (wordCount >= lengthReq.min && wordCount <= lengthReq.max) {
    contentScore += 5
  }

  // Sentence variety
  if (sentenceCount >= 3 && type === 'summarize_written_text') contentScore += 5
  if (sentenceCount >= 5 && type === 'write_essay') contentScore += 5

  contentScore = Math.max(0, Math.min(90, contentScore))

  // === GRAMMAR SCORE (0-90) ===
  const grammarErrors = countGrammarErrors(trimmedText)
  const errorRate = grammarErrors / Math.max(1, sentenceCount)

  let grammarScore = 85
  grammarScore -= Math.min(40, grammarErrors * 5)
  grammarScore -= Math.min(20, errorRate * 10)

  // Bonus for proper capitalization and punctuation
  if (/^[A-Z]/.test(trimmedText)) grammarScore += 3
  if (/[.!?]$/.test(trimmedText)) grammarScore += 2

  grammarScore = Math.max(0, Math.min(90, grammarScore))

  // === VOCABULARY SCORE (0-90) ===
  const academicCount = countAcademicWords(trimmedText)
  const academicRatio = academicCount / Math.max(1, wordCount)

  let vocabularyScore = 60
  vocabularyScore += Math.min(20, academicCount * 3)
  vocabularyScore += Math.min(10, uniqueWordRatio * 15)

  // Penalize very short or repetitive text
  if (uniqueWordRatio < 0.4) vocabularyScore -= 15
  if (uniqueWordRatio > 0.7) vocabularyScore += 5

  vocabularyScore = Math.max(0, Math.min(90, vocabularyScore))

  // === COHERENCE SCORE (0-90) ===
  const transitionCount = countTransitionWords(trimmedText)

  let coherenceScore = 65
  coherenceScore += Math.min(15, transitionCount * 3)

  // Paragraph structure (check for reasonable sentence length variance)
  const sentenceLengths = sentences.map(s => getWords(s).length)
  const lengthVariance = sentenceLengths.length > 1
    ? Math.sqrt(sentenceLengths.reduce((sum, l) => sum + Math.pow(l - avgSentenceLength, 2), 0) / sentenceLengths.length)
    : 0

  // Good variance suggests varied sentence structure
  if (lengthVariance > 3 && lengthVariance < 15) coherenceScore += 10

  // Penalize very short average sentences
  if (avgSentenceLength < 8) coherenceScore -= 10
  if (avgSentenceLength > 30) coherenceScore -= 5

  coherenceScore = Math.max(0, Math.min(90, coherenceScore))

  // === TOTAL SCORE ===
  const total = Math.round(
    (contentScore * 0.3 + grammarScore * 0.25 + vocabularyScore * 0.2 + coherenceScore * 0.25)
  )

  // === FEEDBACK ===
  let feedback = ''
  if (total >= 75) {
    feedback = 'Excellent writing! Well-structured with good vocabulary and clear organization.'
  } else if (total >= 60) {
    feedback = 'Good response. '
    if (grammarScore < 60) feedback += 'Review grammar and punctuation. '
    if (vocabularyScore < 60) feedback += 'Try using more varied vocabulary. '
    if (coherenceScore < 60) feedback += 'Add transition words for better flow. '
  } else if (total >= 45) {
    feedback = 'Needs improvement. '
    if (contentScore < 50) feedback += 'Ensure your response meets length requirements. '
    if (grammarScore < 50) feedback += 'Focus on basic grammar rules. '
    if (vocabularyScore < 50) feedback += 'Expand your vocabulary range. '
    if (coherenceScore < 50) feedback += 'Structure your ideas more clearly. '
  } else {
    feedback = 'Practice more. Focus on: proper length, correct grammar, varied vocabulary, and logical organization.'
  }

  return {
    content: contentScore,
    grammar: grammarScore,
    vocabulary: vocabularyScore,
    coherence: coherenceScore,
    total,
    feedback: feedback.trim(),
    meta: {
      wordCount,
      sentenceCount,
      uniqueWordRatio: Number(uniqueWordRatio.toFixed(3)),
      avgSentenceLength: Number(avgSentenceLength.toFixed(1))
    }
  }
}

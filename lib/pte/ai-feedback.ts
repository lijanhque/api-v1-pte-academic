import { AIFeedbackData, QuestionType, TestSection } from './types'

export async function generateAIFeedback(
  questionType: QuestionType,
  section: TestSection,
  userAnswer: string,
  correctAnswer?: string
): Promise<AIFeedbackData> {
  // Check if OpenAI API key is available
  if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== 'your_openai_api_key'
  ) {
    try {
      // Use OpenAI for real AI feedback
      return await generateAIFeedbackWithOpenAI(
        questionType,
        section,
        userAnswer,
        correctAnswer
      )
    } catch (error) {
      console.error('OpenAI API error, falling back to mock feedback:', error)
    }
  }

  // Fallback to mock feedback
  if (section === 'WRITING') {
    return generateWritingFeedback(userAnswer, questionType)
  }

  if (section === 'SPEAKING') {
    return generateSpeakingFeedback(userAnswer, questionType)
  }

  return generateBasicFeedback(userAnswer, correctAnswer)
}

function generateWritingFeedback(
  userAnswer: string,
  questionType: QuestionType
): AIFeedbackData {
  const wordCount = userAnswer.split(/\s+/).length
  const sentenceCount = userAnswer
    .split(/[.!?]+/)
    .filter((s) => s.trim()).length
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0

  // Mock scoring based on basic metrics
  const contentScore = Math.min(90, 60 + wordCount / 10)
  const grammarScore = 75 + Math.random() * 15
  const vocabularyScore = 70 + Math.random() * 20
  const spellingScore = 80 + Math.random() * 15

  const overallScore = Math.round(
    (contentScore + grammarScore + vocabularyScore + spellingScore) / 4
  )

  return {
    overallScore,
    content: {
      score: Math.round(contentScore),
      feedback:
        wordCount < 50
          ? 'Your response is too short. Aim for more detailed content.'
          : wordCount > 300
            ? 'Good length! Your response covers the topic well.'
            : 'Adequate length. Consider adding more supporting details.',
    },
    grammar: {
      score: Math.round(grammarScore),
      feedback:
        grammarScore > 80
          ? 'Excellent grammar usage with minimal errors.'
          : 'Some grammatical errors detected. Review sentence structures.',
    },
    vocabulary: {
      score: Math.round(vocabularyScore),
      feedback:
        vocabularyScore > 80
          ? 'Rich vocabulary with appropriate word choices.'
          : 'Consider using more varied vocabulary to enhance your writing.',
    },
    spelling: {
      score: Math.round(spellingScore),
      feedback:
        spellingScore > 85
          ? 'Excellent spelling accuracy.'
          : 'A few spelling errors detected. Proofread carefully.',
    },
    suggestions: [
      'Use more transition words to improve flow',
      'Vary your sentence structures for better readability',
      'Include specific examples to support your arguments',
    ],
    strengths: [
      'Clear main idea',
      avgWordsPerSentence > 15
        ? 'Good sentence complexity'
        : 'Concise writing style',
    ],
    areasForImprovement: [
      'Paragraph organization',
      'Use of advanced vocabulary',
      'Argument development',
    ],
  }
}

function generateSpeakingFeedback(
  userAnswer: string,
  questionType: QuestionType
): AIFeedbackData {
  // Mock speaking feedback
  // Returns scores on 0-90 scale (will be converted to 0-5 in speaking-score.ts)

  const wordCount = userAnswer.split(/\s+/).filter(Boolean).length

  // Generate realistic scores based on word count and question type
  let pronunciationScore = 70 + Math.random() * 20
  let fluencyScore = 65 + Math.random() * 25
  let contentScore = 60 + Math.random() * 20

  // For Describe Image, content score is heavily based on word count
  if (questionType === QuestionType.DESCRIBE_IMAGE) {
    if (wordCount >= 60) contentScore = 75 + Math.random() * 15 // 12+ items likely
    else if (wordCount >= 45) contentScore = 65 + Math.random() * 15 // 9-11 items
    else if (wordCount >= 30) contentScore = 55 + Math.random() * 15 // 6-8 items
    else if (wordCount >= 20) contentScore = 45 + Math.random() * 15 // 4-5 items
    else contentScore = 30 + Math.random() * 15 // less than 4 items
  }

  const overallScore = Math.round(
    (contentScore * 0.4 + pronunciationScore * 0.3 + fluencyScore * 0.3)
  )

  return {
    overallScore,
    pronunciation: {
      score: Math.round(pronunciationScore),
      feedback:
        pronunciationScore > 80
          ? 'Excellent pronunciation with clear enunciation.'
          : pronunciationScore > 60
            ? 'Good pronunciation overall. Some sounds could be clearer.'
            : 'Work on pronunciation of specific sounds. Practice with native speakers.',
    },
    fluency: {
      score: Math.round(fluencyScore),
      feedback:
        fluencyScore > 75
          ? 'Smooth delivery with natural pauses and good rhythm.'
          : fluencyScore > 55
            ? 'Generally fluent but with some hesitations. Practice to improve flow.'
            : 'Try to reduce hesitations. Practice speaking on various topics to build fluency.',
    },
    content: {
      score: Math.round(contentScore),
      feedback:
        questionType === QuestionType.DESCRIBE_IMAGE
          ? contentScore > 75
            ? 'Comprehensive description covering most key elements, trends, and relationships.'
            : contentScore > 60
              ? 'Good coverage of main elements. Try to describe more details and relationships.'
              : contentScore > 45
                ? 'Basic description provided. Include more specific data points and trends.'
                : 'Response too brief. Describe at least 12 key elements from the image.'
          : contentScore > 75
            ? 'Comprehensive response covering all points.'
            : 'Include more relevant details in your response.',
    },
    suggestions:
      questionType === QuestionType.DESCRIBE_IMAGE
        ? [
            'Practice describing charts using the INTRO-OVERVIEW-KEY FEATURES-CONCLUSION structure',
            'Aim to mention 12+ specific data points or elements from the image',
            'Use comparison language (higher than, lower than, increased, decreased)',
            'Record yourself and check if you spoke for at least 30 seconds',
          ]
        : [
            'Practice speaking for 2-3 minutes on random topics',
            'Record yourself and listen for areas to improve',
            'Focus on stress and intonation patterns',
          ],
    strengths:
      wordCount >= 50
        ? ['Good response length', 'Clear voice projection']
        : ['Clear voice projection'],
    areasForImprovement:
      questionType === QuestionType.DESCRIBE_IMAGE
        ? [
            wordCount < 50 ? 'Include more details and data points' : '',
            'Natural flow and rhythm',
            'Use of descriptive vocabulary (peak, decline, fluctuate, etc.)',
          ].filter(Boolean)
        : [
            'Pronunciation consistency',
            'Natural flow and rhythm',
            'Vocabulary range',
          ],
  }
}

function generateBasicFeedback(
  userAnswer: string,
  correctAnswer?: string
): AIFeedbackData {
  const isCorrect = correctAnswer
    ? userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    : false

  const overallScore = isCorrect ? 100 : 0

  return {
    overallScore,
    suggestions: isCorrect
      ? ['Keep up the good work!']
      : ['Review the question carefully', 'Practice similar question types'],
    strengths: isCorrect ? ['Correct answer selected'] : [],
    areasForImprovement: isCorrect
      ? []
      : ['Question comprehension', 'Answer selection strategy'],
  }
}

// Function to integrate with OpenAI (for production use)
// Note: Requires 'openai' package to be installed: pnpm add openai
export async function generateAIFeedbackWithOpenAI(
  questionType: QuestionType,
  section: TestSection,
  userAnswer: string,
  correctAnswer?: string
): Promise<AIFeedbackData> {
  // Dynamic import to avoid build errors when package is not installed
  // Dynamic import via Function constructor to avoid bundler resolution of optional dependency
  const { default: OpenAI } = await (Function(
    'specifier',
    'return import(specifier)'
  )('openai') as Promise<any>)

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const systemPrompt = `You are an expert PTE Academic exam scorer. Analyze the student's response and provide detailed, constructive feedback in JSON format.

For ${section} section, specifically ${questionType} questions, evaluate the response based on PTE scoring criteria.

IMPORTANT: For SPEAKING tasks, use the 0-90 scale for individual criteria scores (they will be converted to 0-5 scale automatically).
- For Describe Image: Content score should reflect number of elements described (12+ elements = 80-90, 9-11 = 65-79, 6-8 = 50-64, etc.)
- Pronunciation: 81-90 = native-like, 61-80 = very good, 41-60 = good, 21-40 = limited, 1-20 = very limited
- Fluency: 81-90 = smooth with natural pauses, 61-80 = generally fluent, 41-60 = some hesitations, etc.

Return a JSON object with this exact structure:
{
  "overallScore": number (0-90, weighted average),
  "pronunciation": { "score": number (0-90), "feedback": "string" } (only for SPEAKING),
  "fluency": { "score": number (0-90), "feedback": "string" } (only for SPEAKING),
  "content": { "score": number (0-90), "feedback": "string" } (for SPEAKING and WRITING),
  "grammar": { "score": number (0-90), "feedback": "string" } (only for WRITING),
  "vocabulary": { "score": number (0-90), "feedback": "string" } (only for WRITING),
  "spelling": { "score": number (0-90), "feedback": "string" } (only for WRITING),
  "suggestions": ["string array of 3-5 specific, actionable improvement suggestions"],
  "strengths": ["string array of 2-4 specific strengths identified"],
  "areasForImprovement": ["string array of 2-4 specific areas to improve"]
}

Be specific, constructive, and follow official PTE Academic scoring guidelines.`

  const userPrompt = `Question Type: ${questionType}
Section: ${section}
${correctAnswer ? `Correct Answer: ${correctAnswer}` : ''}
Student's Answer: ${userAnswer}

Please provide detailed feedback following PTE scoring criteria.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const feedback = JSON.parse(content.trim())
    return feedback as AIFeedbackData
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Invalid JSON response from OpenAI')
  }
}

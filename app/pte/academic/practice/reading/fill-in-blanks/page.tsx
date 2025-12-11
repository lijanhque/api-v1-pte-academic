import { TextCursor } from 'lucide-react'
import { QuestionListPage } from '@/components/pte/universal'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'

// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'

/**
 * Fetch and normalize "Fill in the Blanks" reading questions.
 */
async function getQuestions() {
  try {
    const result = await getQuestionsDirectly('reading', 'fill_in_blanks', {
      page: 1,
      pageSize: 100,
      isActive: true,
    })

    return result.items.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching Fill in Blanks questions:', error)
    return []
  }
}

/**
 * Reading: Fill in the Blanks practice page with universal data table.
 */
export default async function FillInBlanksPage() {
  const questions = await getQuestions()

  return (
    <QuestionListPage
      section="reading"
      questionType="fill_in_blanks"
      questionTypeSlug="fill-in-blanks"
      title="Reading: Fill in the Blanks"
      description="Drag and drop words to fill in the blanks in the reading passage"
      icon={<TextCursor className="h-8 w-8 text-primary" />}
      questions={questions}
      searchable
      filterable
    />
  )
}

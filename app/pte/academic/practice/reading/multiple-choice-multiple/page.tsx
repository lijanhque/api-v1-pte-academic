import { QuestionListTable } from '@/components/pte/question-list-table'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { CheckSquare } from 'lucide-react'

/**
 * Fetches reading multiple-choice-multiple questions and normalizes them for display.
 *
 * @returns An array of questions with shape `{ id, title, difficulty, bookmarked, practiceCount }`.
 * `difficulty` defaults to `'Medium'` when missing and `bookmarked` defaults to `false`. Returns an
 * empty array if fetching fails.
 */
async function getQuestions() {
  try {
    const result = await getQuestionsDirectly('reading', 'multiple_choice_multiple', {
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
    console.error('Error fetching Multiple Choice Multiple questions:', error)
    return []
  }
}

/**
 * Renders the "Multiple Choice (Multiple Answers)" practice page and displays available reading questions.
 *
 * @returns The page's React element containing the header and a card with a table of fetched questions.
 */
export default async function MultipleChoiceMultiplePage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <CheckSquare className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Multiple Choice (Multiple Answers)</h1>
          <p className="text-muted-foreground">
            Read the text and select all correct answers from the options
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Your progress will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/reading"
            sectionType="multiple-choice-multiple"
          />
        </CardContent>
      </Card>
    </div>
  )
}
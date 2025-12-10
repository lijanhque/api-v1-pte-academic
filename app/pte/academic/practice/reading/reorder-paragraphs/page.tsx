import { QuestionListTable } from '@/components/pte/question-list-table'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { ListOrdered } from 'lucide-react'

/**
 * Fetches Re-order Paragraphs items and formats them for display in the question list.
 *
 * @returns An array of question objects with shape `{ id, title, difficulty, bookmarked, practiceCount }`.
 *          `difficulty` defaults to `"Medium"` when absent, `bookmarked` defaults to `false`, and
 *          `practiceCount` is set to `0`. Returns an empty array if the fetch fails.
 */
async function getQuestions() {
  try {
    const result = await getQuestionsDirectly('reading', 'reorder_paragraphs', {
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
    console.error('Error fetching Reorder Paragraphs questions:', error)
    return []
  }
}

/**
 * Render the "Re-order Paragraphs" practice page showing available questions and controls.
 *
 * Fetches the list of Reorder Paragraphs questions and renders a header with description and
 * a card containing the question count and a QuestionListTable for selecting practice items.
 *
 * @returns A React element containing the Re-order Paragraphs UI and populated question list.
 */
export default async function ReorderParagraphsPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <ListOrdered className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Re-order Paragraphs</h1>
          <p className="text-muted-foreground">
            Drag and drop paragraphs to arrange them in the correct logical order
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
            sectionType="reorder-paragraphs"
          />
        </CardContent>
      </Card>
    </div>
  )
}
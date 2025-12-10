import { QuestionListTable } from '@/components/pte/question-list-table'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { Circle } from 'lucide-react'

/**
 * Retrieve summaries of reading multiple-choice (single-answer) questions.
 *
 * Each summary contains `id`, `title`, `difficulty` (defaults to `"Medium"` if missing),
 * `bookmarked` (defaults to `false` if missing), and `practiceCount` (always `0`).
 *
 * @returns An array of question summary objects as described above; returns an empty array if fetching fails.
 */
async function getQuestions() {
  try {
    const result = await getQuestionsDirectly('reading', 'multiple_choice_single', {
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
    console.error('Error fetching Multiple Choice Single questions:', error)
    return []
  }
}

/**
 * Renders the Multiple Choice (Single Answer) practice page and loads available questions.
 *
 * Displays a header with title and description, then a card showing the number of available questions
 * and a QuestionListTable populated with the fetched question summaries.
 *
 * @returns The React element for the Multiple Choice (Single Answer) practice interface, including header, question count, and question list.
 */
export default async function MultipleChoiceSinglePage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Circle className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Multiple Choice (Single Answer)</h1>
          <p className="text-muted-foreground">
            Read the text and select the single best answer from the options
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
            sectionType="multiple-choice-single"
          />
        </CardContent>
      </Card>
    </div>
  )
}
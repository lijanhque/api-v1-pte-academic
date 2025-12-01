import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { TextCursor } from 'lucide-react'

/**
 * Fetches and normalizes "Fill in the Blanks" reading questions.
 *
 * Returns an array of question objects containing `id`, `title`, `difficulty`,
 * `bookmarked`, and `practiceCount`. If `difficulty` or `bookmarked` are missing
 * they default to `"Medium"` and `false` respectively. Returns an empty array
 * if fetching fails.
 *
 * @returns An array of normalized question objects or an empty array on error.
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
 * Render the "Reading: Fill in the Blanks" practice page and its available questions list.
 *
 * Fetches the set of Fill in the Blanks questions and renders a header, summary, and a
 * question table showing the total available questions and allowing selection to practice.
 *
 * @returns A React element representing the Fill in the Blanks practice page.
 */
export default async function FillInBlanksPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <TextCursor className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Reading: Fill in the Blanks</h1>
          <p className="text-muted-foreground">
            Drag and drop words to fill in the blanks in the reading passage
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
            sectionType="fill-in-blanks"
          />
        </CardContent>
      </Card>
    </div>
  )
}
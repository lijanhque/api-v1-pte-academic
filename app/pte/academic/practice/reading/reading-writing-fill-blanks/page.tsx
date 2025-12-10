import { QuestionListTable } from '@/components/pte/question-list-table'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuestionsDirectly } from '@/lib/pte/direct-queries'
import { FileText } from 'lucide-react'

/**
 * Fetches simplified question records for the Reading & Writing: Fill in the Blanks section.
 *
 * @returns An array of question objects with `id`, `title`, `difficulty` (defaults to `"Medium"`), `bookmarked` (defaults to `false`), and `practiceCount` (`0`); returns an empty array if the fetch fails.
 */
async function getQuestions() {
  try {
    const result = await getQuestionsDirectly('reading', 'reading_writing_fill_blanks', {
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
    console.error('Error fetching RW-FIB questions:', error)
    return []
  }
}

/**
 * Render the Reading & Writing: Fill in the Blanks practice page.
 *
 * @returns The page's JSX element showing a header with title and subtitle, the count of available questions, and a QuestionListTable configured for the "reading-writing-fill-blanks" section populated with available questions.
 */
export default async function ReadingWritingFillBlanksPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Reading & Writing: Fill in the Blanks</h1>
          <p className="text-muted-foreground">
            Fill in the blanks with the most appropriate words from the dropdown options
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
            sectionType="reading-writing-fill-blanks"
          />
        </CardContent>
      </Card>
    </div>
  )
}
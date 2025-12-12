import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AlertTriangle } from 'lucide-react'


async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'highlight_incorrect_words'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching highlight incorrect words questions:', error)
    return []
  }
}

export default async function HighlightIncorrectWordsPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Highlight Incorrect Words</h1>
          <p className="text-muted-foreground">
            Select words in the transcript that differ from what you hear
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Click on words that don&apos;t match the recording.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/listening"
            sectionType="highlight-incorrect-words"
          />
        </CardContent>
      </Card>
    </div>
  )
}

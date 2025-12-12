import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { FileText } from 'lucide-react'


async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'highlight_correct_summary'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching highlight correct summary questions:', error)
    return []
  }
}

export default async function HighlightCorrectSummaryPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-pink-500/10">
          <FileText className="h-8 w-8 text-pink-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Highlight Correct Summary</h1>
          <p className="text-muted-foreground">
            Listen to a recording and select the paragraph that best summarizes it
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Focus on the main idea and key points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/listening"
            sectionType="highlight-correct-summary"
          />
        </CardContent>
      </Card>
    </div>
  )
}

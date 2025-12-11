import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'summarize_spoken_text'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching summarize spoken text questions:', error)
    return []
  }
}

export default async function SummarizeSpokenTextPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Summarize Spoken Text</h1>
          <p className="text-muted-foreground">
            Listen to a recording and write a 50-70 word summary
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Take notes and summarize the main points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/listening"
            sectionType="summarize-spoken-text"
          />
        </CardContent>
      </Card>
    </div>
  )
}

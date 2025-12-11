import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'fill_in_blanks'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching fill in blanks questions:', error)
    return []
  }
}

export default async function FillInBlanksPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-orange-500/10">
          <ClipboardList className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fill in the Blanks</h1>
          <p className="text-muted-foreground">
            Listen to a recording and type the missing words in the transcript
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Spell words correctly as you hear them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/listening"
            sectionType="fill-in-blanks"
          />
        </CardContent>
      </Card>
    </div>
  )
}

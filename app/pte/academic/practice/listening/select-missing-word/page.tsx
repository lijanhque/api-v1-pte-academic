import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { HelpCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'select_missing_word'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching select missing word questions:', error)
    return []
  }
}

export default async function SelectMissingWordPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-teal-500/10">
          <HelpCircle className="h-8 w-8 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Select Missing Word</h1>
          <p className="text-muted-foreground">
            Listen to a recording and select the word that completes it
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. The recording will end with a beep instead of the last word.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/listening"
            sectionType="select-missing-word"
          />
        </CardContent>
      </Card>
    </div>
  )
}

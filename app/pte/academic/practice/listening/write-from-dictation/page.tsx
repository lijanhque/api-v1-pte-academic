import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PenTool } from 'lucide-react'


async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'write_from_dictation'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: 0,
    }))
  } catch (error) {
    console.error('Error fetching write from dictation questions:', error)
    return []
  }
}

export default async function WriteFromDictationPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-indigo-500/10">
          <PenTool className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Write from Dictation</h1>
          <p className="text-muted-foreground">
            Listen to a sentence and type exactly what you hear
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Spell every word correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/listening"
            sectionType="write-from-dictation"
          />
        </CardContent>
      </Card>
    </div>
  )
}

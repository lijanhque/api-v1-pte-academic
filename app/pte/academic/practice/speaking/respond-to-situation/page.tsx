import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { UserCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, 'respond_to_a_situation'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: q.appearanceCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching respond to situation questions:', error)
    return []
  }
}

export default async function RespondToSituationPage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-indigo-500/10">
          <UserCheck className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Respond to Situation</h1>
          <p className="text-muted-foreground">
            Read about a situation and provide an appropriate response
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Consider the context and respond appropriately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/speaking"
            sectionType="respond-to-situation"
          />
        </CardContent>
      </Card>
    </div>
  )
}

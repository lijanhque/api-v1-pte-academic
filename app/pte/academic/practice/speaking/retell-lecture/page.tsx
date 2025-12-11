import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Radio } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, 'retell_lecture'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: q.appearanceCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching retell lecture questions:', error)
    return []
  }
}

export default async function RetellLecturePage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-orange-500/10">
          <Radio className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Re-tell Lecture</h1>
          <p className="text-muted-foreground">
            Listen to a lecture and re-tell it in your own words
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Take notes while listening and organize your response.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/speaking"
            sectionType="retell-lecture"
          />
        </CardContent>
      </Card>
    </div>
  )
}

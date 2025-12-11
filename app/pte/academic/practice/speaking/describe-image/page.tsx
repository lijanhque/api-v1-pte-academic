import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Image } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getQuestions() {
  try {
    const questions = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, 'describe_image'))
      .limit(100)

    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: q.appearanceCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching describe image questions:', error)
    return []
  }
}

export default async function DescribeImagePage() {
  const questions = await getQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-purple-500/10">
          <Image className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Describe Image</h1>
          <p className="text-muted-foreground">
            Look at an image and describe it in detail within 40 seconds
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Questions ({questions.length})</CardTitle>
          <CardDescription>
            Select a question to start practicing. Focus on key features, trends, and conclusions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionListTable
            questions={questions}
            basePath="/pte/academic/practice/speaking"
            sectionType="describe-image"
          />
        </CardContent>
      </Card>
    </div>
  )
}

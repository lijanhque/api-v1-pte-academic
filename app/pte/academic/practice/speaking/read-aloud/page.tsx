import { QuestionListTable } from '@/components/pte/question-list-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Mic } from 'lucide-react'

/**
 * Fetches read-aloud speaking questions from the database and returns them in a UI-friendly shape.
 *
 * Each returned object contains the question's id, title, difficulty, bookmarked state, and practiceCount.
 *
 * @returns An array of question objects with the following properties:
 * - `id` — Question identifier
 * - `title` — Question title or prompt
 * - `difficulty` — Difficulty level; defaults to `'Medium'` when not set
 * - `bookmarked` — `true` if bookmarked, `false` otherwise (defaults to `false`)
 * - `practiceCount` — Number of times practiced; defaults to `0`
 *
 * Returns an empty array if fetching fails.
 */
async function getReadAloudQuestions() {
  try {
    const questions = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, 'read_aloud'))
      .limit(100)
    
    return questions.map(q => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      bookmarked: q.bookmarked || false,
      practiceCount: q.appearanceCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching read aloud questions:', error)
    return []
  }
}

/**
 * Renders the Read Aloud practice page and displays available read-aloud questions.
 *
 * Fetches read-aloud questions and renders a header with a microphone icon, a brief description, and a card containing a QuestionListTable for selecting and practicing questions.
 *
 * @returns The page's JSX element containing the header, descriptive text, and a QuestionListTable populated with the fetched questions.
 */
export default async function ReadAloudQuestionsPage() {
  const questions = await getReadAloudQuestions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Read Aloud</h1>
          <p className="text-muted-foreground">
            Practice reading text aloud with clear pronunciation and fluency
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
            basePath="/pte/academic/practice/speaking"
            sectionType="read-aloud"
          />
        </CardContent>
      </Card>
    </div>
  )
}
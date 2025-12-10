import { ReadAloud } from '@/components/pte/speaking/read-aloud'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

/**
 * Fetches a speaking question by its identifier from the database.
 *
 * @param id - The speaking question's unique identifier
 * @returns The speaking question record if found, or `null` if no matching record exists or an error occurs
 */
async function getQuestion(id: string) {
  try {
    const questions = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.id, id))
      .limit(1)

    return questions[0] || null
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

/**
 * Renders the read-aloud question page for a given question ID.
 *
 * Fetches the question by ID and displays navigation controls, the question title with timing
 * instructions, and the ReadAloud interactive component.
 *
 * @param props - Component props containing route parameters.
 * @param props.params - Route parameters object with the `id` of the question to load.
 * @returns The page element displaying navigation, question details, and the ReadAloud component.
 */
export default async function ReadAloudQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <a href="/pte/academic/practice/speaking/read-aloud" className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline">
          <span className="mr-2">←</span>
          Back to Question List
        </a>
        <button className="text-sm px-2 py-1 rounded border">Bookmark</button>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">Read the text out loud clearly. Prep: 30s · Record: 40s</p>
      </div>

      <div className="space-y-6">
        <ReadAloud question={question} />
      </div>
    </div>
  )
}
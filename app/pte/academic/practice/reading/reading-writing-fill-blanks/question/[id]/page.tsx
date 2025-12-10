import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { readingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

/**
 * Retrieve a single reading question by its identifier.
 *
 * @param id - The reading question's unique identifier
 * @returns The matching question record, or `null` if no matching record is found or an error occurs
 */
async function getQuestion(id: string) {
  try {
    const questions = await db
      .select()
      .from(readingQuestions)
      .where(eq(readingQuestions.id, id))
      .limit(1)

    return questions[0] || null
  } catch (error) {
    console.error('Error fetching RW-FIB question:', error)
    return null
  }
}

/**
 * Render the Reading & Writing: Fill in the Blanks question page for a given question id.
 *
 * Fetches the question by id and displays the question title, description, and the ReadingQuestionClient
 * configured for the "reading_writing_fill_blanks" question type. If the question is not found or its
 * type does not match, the route responds with a 404.
 *
 * @param props - An object whose `params` property is a promise that resolves to the route parameters.
 *                 `params.id` is the question id to load.
 * @returns A JSX element representing the question page.
 */
export default async function ReadingWritingFillBlanksQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'reading_writing_fill_blanks') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/reading/reading-writing-fill-blanks"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Read the passage and fill in the blanks with the most appropriate words
        </p>
      </div>

      <div className="space-y-6">
        <ReadingQuestionClient
          questionId={params.id}
          questionType="reading_writing_fill_blanks"
        />
      </div>
    </div>
  )
}
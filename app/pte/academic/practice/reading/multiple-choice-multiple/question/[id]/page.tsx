import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { readingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

/**
 * Retrieve a reading question by its ID.
 *
 * Returns the matching reading question record, or `null` if no record is found or an error occurs.
 *
 * @param id - The reading question's ID
 * @returns The matching reading question record, or `null` if not found or on error
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
    console.error('Error fetching Multiple Choice Multiple question:', error)
    return null
  }
}

/**
 * Renders the question page for a "multiple_choice_multiple" reading question.
 *
 * Fetches the question using the provided `id`, returns a 404 if the question is missing or not of type "multiple_choice_multiple", and renders the page header, instructions, and the ReadingQuestionClient for answering.
 *
 * @param props - Component props containing route params.
 * @param props.params - A promise that resolves to an object with an `id` string identifying the question to display.
 * @returns The rendered page content for the specified reading question.
 */
export default async function MultipleChoiceMultipleQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'multiple_choice_multiple') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/reading/multiple-choice-multiple"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Read the passage and select all correct answers. There may be more than one.
        </p>
      </div>

      <div className="space-y-6">
        <ReadingQuestionClient
          questionId={params.id}
          questionType="multiple_choice_multiple"
        />
      </div>
    </div>
  )
}
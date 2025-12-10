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
 * @param id - The ID of the reading question to retrieve
 * @returns The question record if found, `null` if no matching record or if a database error occurs
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
    console.error('Error fetching Multiple Choice Single question:', error)
    return null
  }
}

/**
 * Server-side page that renders a single "multiple_choice_single" reading question by ID.
 *
 * Fetches the question using the provided route params and renders a back link, the question
 * title with a brief instruction, and a client component that displays the question content.
 * Triggers a 404 route if the question does not exist or is not of type "multiple_choice_single".
 *
 * @param props - An object whose `params` promise resolves to `{ id: string }`, the question ID.
 * @returns A JSX element that renders the question detail page including navigation and the question client.
 */
export default async function MultipleChoiceSingleQuestionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const question = await getQuestion(params.id)

  if (!question || question.type !== 'multiple_choice_single') {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pte/academic/practice/reading/multiple-choice-single"
          className="inline-flex items-center text-sm px-2 py-1 rounded hover:underline"
        >
          <span className="mr-2">←</span>
          Back to Question List
        </Link>
      </div>

      <div className="rounded border p-4">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="text-muted-foreground">
          Read the passage and select the single best answer
        </p>
      </div>

      <div className="space-y-6">
        <ReadingQuestionClient
          questionId={params.id}
          questionType="multiple_choice_single"
        />
      </div>
    </div>
  )
}